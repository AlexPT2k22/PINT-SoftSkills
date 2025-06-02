const {
  Certificado,
  Curso,
  Utilizador,
  ProgressoModulo,
  Modulos,
} = require("../models/index.js");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

const gerarCodigoVerificacao = () => {
  return uuidv4().replace(/-/g, "").substring(0, 16).toUpperCase();
};

const verificarConclusaoCurso = async (userId, courseId) => {
  try {
    // Get total modules for the course
    const totalModulos = await Modulos.count({
      where: { ID_CURSO: courseId },
    });

    // Get completed modules for the user
    const modulosCompletos = await ProgressoModulo.count({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        COMPLETO: true,
      },
    });

    // Return true if all modules are completed
    return totalModulos > 0 && totalModulos === modulosCompletos;
  } catch (error) {
    console.error("Error verifying course completion:", error);
    return false;
  }
};

const gerarCertificado = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    // Verify course completion
    const cursoCompleto = await verificarConclusaoCurso(userId, courseId);

    if (!cursoCompleto) {
      return res.status(403).json({
        success: false,
        message:
          "Complete todos os módulos do curso para receber o certificado",
      });
    }

    // Check if certificate already exists
    let certificado = await Certificado.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
      },
    });

    if (!certificado) {
      certificado = await Certificado.create({
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        CODIGO_VERIFICACAO: gerarCodigoVerificacao(),
        DATA_EMISSAO: new Date(),
      });
    }

    // Get course and user data
    const [curso, usuario] = await Promise.all([
      Curso.findByPk(courseId),
      Utilizador.findByPk(userId),
    ]);

    if (!curso || !usuario) {
      return res.status(404).json({
        success: false,
        message: "Curso ou usuário não encontrado",
      });
    }

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, "../public/certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Generate PDF path
    const pdfPath = path.join(
      certificatesDir,
      `${certificado.CODIGO_VERIFICACAO}.pdf`
    );
    const pdfUrl = `/certificates/${certificado.CODIGO_VERIFICACAO}.pdf`;

    // Create PDF with better styling
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 0,
    });

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(pdfPath));

    // Add background pattern
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8f9fa");

    // Add border
    const borderWidth = 20;
    doc
      .rect(
        borderWidth,
        borderWidth,
        doc.page.width - borderWidth * 2,
        doc.page.height - borderWidth * 2
      )
      .strokeColor("#39639c")
      .lineWidth(2)
      .stroke();

    // Add decorative corners
    const cornerSize = 40;
    // Top left corner
    doc
      .polygon(
        [borderWidth, borderWidth],
        [borderWidth + cornerSize, borderWidth],
        [borderWidth, borderWidth + cornerSize]
      )
      .fill("#39639c");
    // Top right corner
    doc
      .polygon(
        [doc.page.width - borderWidth, borderWidth],
        [doc.page.width - borderWidth - cornerSize, borderWidth],
        [doc.page.width - borderWidth, borderWidth + cornerSize]
      )
      .fill("#39639c");
    // Bottom left corner
    doc
      .polygon(
        [borderWidth, doc.page.height - borderWidth],
        [borderWidth + cornerSize, doc.page.height - borderWidth],
        [borderWidth, doc.page.height - borderWidth - cornerSize]
      )
      .fill("#39639c");
    // Bottom right corner
    doc
      .polygon(
        [doc.page.width - borderWidth, doc.page.height - borderWidth],
        [
          doc.page.width - borderWidth - cornerSize,
          doc.page.height - borderWidth,
        ],
        [
          doc.page.width - borderWidth,
          doc.page.height - borderWidth - cornerSize,
        ]
      )
      .fill("#39639c");

    // Add logo
    const logoPath = path.join(__dirname, "../public/images/Logo.png");
    doc.image(logoPath, 50, 50, { width: 150 });

    // Center all content
    const centerY = doc.page.height / 2 - 100; // Adjust starting Y position

    // Add certificate content
    doc
      .font("Helvetica-Bold")
      .fontSize(42)
      .fillColor("#39639c")
      .text("CERTIFICADO", 0, centerY, {
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(16)
      .fillColor("#373737")
      .text("Este certificado é conferido a", 0, centerY + 70, {
        align: "center",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#39639c")
      .text(usuario.NOME, 0, centerY + 100, {
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(16)
      .fillColor("#373737")
      .text("pela conclusão com êxito do curso", 0, centerY + 150, {
        align: "center",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#39639c")
      .text(curso.NOME, 0, centerY + 180, {
        align: "center",
      });

    // Add date
    const dateStr = new Date().toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#373737")
      .text(`Emitido em ${dateStr}`, 0, centerY + 230, {
        align: "center",
      });

    // Create custom QR code with logo
    const qrSize = 100;
    const qrOptions = {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#39639c",
        light: "#ffffff",
      },
    };

    // Generate QR code with verification URL
    const qrCodeDataUrl = await QRCode.toDataURL(
      `http://localhost:4000/verify-certificate/${certificado.CODIGO_VERIFICACAO}`,
      qrOptions
    );

    // Add QR code
    doc.image(qrCodeDataUrl, 100, doc.page.height - 150, {
      width: qrSize,
    });

    // Add verification code
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#6c757d")
      .text(
        `Código de Verificação: ${certificado.CODIGO_VERIFICACAO}`,
        100,
        doc.page.height - 40,
        { align: "center", width: 200 }
      );

    // Finalize PDF
    doc.end();

    // Update certificate URL in database
    await certificado.update({ URL_CERTIFICADO: pdfUrl });

    return res.status(200).json({
      success: true,
      certificado: {
        codigo: certificado.CODIGO_VERIFICACAO,
        url: `http://localhost:4000${pdfUrl}`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao gerar certificado",
    });
  }
};

const verificarCertificado = async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await Certificado.findOne({
      where: { CODIGO_VERIFICACAO: codigo },
      include: [
        { model: Utilizador, attributes: ["NOME"] },
        { model: Curso, attributes: ["NOME"] },
      ],
    });

    console.log("Certificado encontrado:", certificado);

    if (!certificado) {
      return res.status(404).json({
        success: false,
        message: "Certificado não encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      certificado: {
        codigo: certificado.CODIGO_VERIFICACAO,
        dataEmissao: certificado.DATA_EMISSAO,
        aluno: certificado.UTILIZADOR.NOME,
        curso: certificado.CURSO.NOME,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar certificado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar certificado",
    });
  }
};

module.exports = {
  gerarCertificado,
  verificarCertificado,
};
