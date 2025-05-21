const { Certificado, Curso, Utilizador, ProgressoModulo, Modulos } = require("../models");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

const gerarCodigoVerificacao = () => {
  return uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
};

const verificarConclusaoCurso = async (userId, courseId) => {
  try {
    // Get total modules for the course
    const totalModulos = await Modulos.count({
      where: { ID_CURSO: courseId }
    });

    // Get completed modules for the user
    const modulosCompletos = await ProgressoModulo.count({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        COMPLETO: true
      }
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
        message: "Complete todos os módulos do curso para receber o certificado"
      });
    }

    // Check if certificate already exists
    let certificado = await Certificado.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId
      }
    });

    if (!certificado) {
      certificado = await Certificado.create({
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        CODIGO_VERIFICACAO: gerarCodigoVerificacao(),
        DATA_EMISSAO: new Date()
      });
    }

    // Get course and user data
    const [curso, usuario] = await Promise.all([
      Curso.findByPk(courseId),
      Utilizador.findByPk(userId)
    ]);

    if (!curso || !usuario) {
      return res.status(404).json({
        success: false,
        message: "Curso ou usuário não encontrado"
      });
    }

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, "../public/certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Generate PDF path
    const pdfPath = path.join(certificatesDir, `${certificado.CODIGO_VERIFICACAO}.pdf`);
    const pdfUrl = `/certificates/${certificado.CODIGO_VERIFICACAO}.pdf`;

    // Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(
      `http://localhost:4000/api/certificados/verificar/${certificado.CODIGO_VERIFICACAO}`
    );

    // Create PDF
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4"
    });

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(pdfPath));

    // Add certificate content
    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .text("CERTIFICADO DE CONCLUSÃO", { align: "center" })
      .moveDown()
      .font("Helvetica")
      .fontSize(16)
      .text(`Certificamos que ${usuario.NOME} concluiu com êxito o curso`, { align: "center" })
      .moveDown()
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(curso.NOME, { align: "center" })
      .moveDown()
      .font("Helvetica")
      .fontSize(14)
      .text(`Código de Verificação: ${certificado.CODIGO_VERIFICACAO}`)
      .moveDown()
      .text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`)
      .image(qrCodeUrl, 450, 400, { width: 100 });

    // Finalize PDF
    doc.end();

    // Update certificate URL in database
    await certificado.update({ URL_CERTIFICADO: pdfUrl });

    return res.status(200).json({
      success: true,
      certificado: {
        codigo: certificado.CODIGO_VERIFICACAO,
        url: `http://localhost:4000${pdfUrl}`
      }
    });

  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao gerar certificado"
    });
  }
};

const verificarCertificado = async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await Certificado.findOne({
      where: { CODIGO_VERIFICACAO: codigo },
      include: [
        { model: Utilizador, attributes: ['NOME'] },
        { model: Curso, attributes: ['NOME'] }
      ]
    });

    if (!certificado) {
      return res.status(404).json({
        success: false,
        message: "Certificado não encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      certificado: {
        codigo: certificado.CODIGO_VERIFICACAO,
        dataEmissao: certificado.DATA_EMISSAO,
        aluno: certificado.UTILIZADOR.NOME,
        curso: certificado.CURSO.NOME
      }
    });

  } catch (error) {
    console.error("Erro ao verificar certificado:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar certificado"
    });
  }
};

module.exports = {
  gerarCertificado,
  verificarCertificado
};