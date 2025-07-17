const {
  Certificado,
  Curso,
  Utilizador,
  ProgressoModulo,
  Modulos,
  SubmissaoAvaliacao,
  AvaliacaoSincrona,
  RespostaQuizAssincrono,
  QuizAssincrono,
  InscricaoSincrono,
  InscricaoAssincrono,
  CursoSincrono,
  CursoAssincrono,
  AvaliacaoFinalSincrona
} = require("../models/index.js");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
require("dotenv").config();

const gerarCodigoVerificacao = () => {
  return uuidv4().replace(/-/g, "").substring(0, 16).toUpperCase();
};

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const calcularNotaFinal = async (userId, courseId) => {
  try {
    let notaFinal = 0;
    let totalAvaliacoes = 0;
    let somaNotas = 0;

    // Verificar se é curso síncrono ou assíncrono
    const [cursoSincrono, cursoAssincrono] = await Promise.all([
      CursoSincrono.findOne({ where: { ID_CURSO: courseId } }),
      CursoAssincrono.findOne({ where: { ID_CURSO: courseId } }),
    ]);

    if (cursoSincrono) {
      // Para cursos síncronos: procurar notas das avaliações
      notaFinal = await AvaliacaoFinalSincrona.findOne({
        where: { ID_UTILIZADOR: userId, ID_CURSO: courseId },
        attributes: ["NOTA_FINAL"],
      });
    }

    if (cursoAssincrono) {
      // Para cursos assíncronos: procurar notas dos quizzes
      const respostas = await RespostaQuizAssincrono.findAll({
        where: { ID_UTILIZADOR: userId },
        include: [
          {
            model: QuizAssincrono,
            where: { ID_CURSO: courseId },
            required: true,
          },
        ],
      });

      respostas.forEach((resposta) => {
        if (resposta.NOTA !== null) {
          // Converter nota de 0-100 para 0-20
          const notaConvertida = (resposta.NOTA * 20) / 100;
          somaNotas += notaConvertida;
          totalAvaliacoes++;
        }
      });

      // Calcular média final
      if (totalAvaliacoes > 0) {
        notaFinal = somaNotas / totalAvaliacoes;
      }
    }

    return parseFloat(notaFinal.toFixed(1));
  } catch (error) {
    console.error("Erro ao calcular nota final:", error);
    return 0;
  }
};

const verificarConclusaoCurso = async (userId, courseId) => {
  try {
    const totalModulos = await Modulos.count({
      where: { ID_CURSO: courseId },
    });

    const modulosCompletos = await ProgressoModulo.count({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        COMPLETO: true,
      },
    });

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
    const cursoCompleto = await verificarConclusaoCurso(userId, courseId);

    if (!cursoCompleto) {
      return res.status(403).json({
        success: false,
        message:
          "Complete todos os módulos do curso para receber o certificado",
      });
    }

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

    // Calcular nota final
    const notaFinal = await calcularNotaFinal(userId, courseId);

    const certificatesDir = path.join(__dirname, "../public/certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const pdfPath = path.join(
      certificatesDir,
      `${certificado.CODIGO_VERIFICACAO}.pdf`
    );
    const pdfUrl = `/certificates/${certificado.CODIGO_VERIFICACAO}.pdf`;

    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 0,
    });

    doc.pipe(fs.createWriteStream(pdfPath));
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8f9fa");

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

    const cornerSize = 40;
    doc
      .polygon(
        [borderWidth, borderWidth],
        [borderWidth + cornerSize, borderWidth],
        [borderWidth, borderWidth + cornerSize]
      )
      .fill("#39639c");
    doc
      .polygon(
        [doc.page.width - borderWidth, borderWidth],
        [doc.page.width - borderWidth - cornerSize, borderWidth],
        [doc.page.width - borderWidth, borderWidth + cornerSize]
      )
      .fill("#39639c");
    doc
      .polygon(
        [borderWidth, doc.page.height - borderWidth],
        [borderWidth + cornerSize, doc.page.height - borderWidth],
        [borderWidth, doc.page.height - borderWidth - cornerSize]
      )
      .fill("#39639c");
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

    const logoPath = path.join(__dirname, "../public/images/Logo.png");
    doc.image(logoPath, 50, 50, { width: 150 });

    const centerY = doc.page.height / 2 - 100;

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

    const qrSize = 100;
    const qrOptions = {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#39639c",
        light: "#ffffff",
      },
    };

    const qrCodeDataUrl = await QRCode.toDataURL(
      // é necessario o await!
      `${FRONTEND_URL}/verify-certificate/${certificado.CODIGO_VERIFICACAO}`,
      qrOptions
    );

    doc.image(qrCodeDataUrl, 100, doc.page.height - 150, {
      width: qrSize,
    });

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

    doc.end();

    await certificado.update({ URL_CERTIFICADO: pdfUrl });

    return res.status(200).json({
      success: true,
      certificado: {
        codigo: certificado.CODIGO_VERIFICACAO,
        url: `${BACKEND_URL}${pdfUrl}`,
        notaFinal: notaFinal,
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

    const notaFinal = await calcularNotaFinal(
      certificado.ID_UTILIZADOR,
      certificado.ID_CURSO
    );

    return res.status(200).json({
      success: true,
      certificado: {
        codigo: certificado.CODIGO_VERIFICACAO,
        dataEmissao: certificado.DATA_EMISSAO,
        aluno: certificado.UTILIZADOR.NOME,
        curso: certificado.CURSO.NOME,
        notaFinal: notaFinal,
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
