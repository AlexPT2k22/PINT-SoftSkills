const {
  Curso,
  CursoAssincrono,
  CursoSincrono,
  ConteudoSincrono,
  Categoria,
  Area,
  InscricaoSincrono,
  FrequenciaSincrono,
  Utilizador,
  Objetivos,
  Habilidades,
  Modulos,
  Topico,
  ProgressoModulo,
  Notas,
  QuizAssincrono,
} = require("../models/index.js");
const { sequelize } = require("../database/database.js");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { notifyAllEnrolled } = require("./notificacao.controller.js");
require("dotenv").config();
const { supabaseAdmin } = require("../database/supabase.js");
const crypto = require("crypto");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const saveFileToSupabase = async (buffer, fileName, userId = "system") => {
  try {
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${Date.now()}-$${fileName}.${fileExtension}`;
    const filePath = `course-modules/${userId}/${uniqueFileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("course-files")
      .upload(filePath, buffer, {
        contentType: getContentType(fileExtension),
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("course-files")
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      fileName: uniqueFileName,
    };
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
};

const getContentType = (extension) => {
  const mimeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
};

const deleteFileFromSupabase = async (filePath) => {
  if (!supabaseAdmin || !filePath) {
    console.warn("Supabase não disponível ou caminho inválido:", filePath);
    return;
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from("course-files")
      .remove([filePath]);

    if (error) {
      console.warn("Warning deleting file from Supabase:", error);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  } catch (error) {
    console.warn("Warning:", error);
  }
};

const streamUpload = (
  buffer,
  folder,
  resource_type = "auto",
  originalFilename = null
) => {
  return new Promise((resolve, reject) => {
    let fileExtension = "";
    let publicId = "";

    if (originalFilename) {
      const lastDot = originalFilename.lastIndexOf(".");
      fileExtension =
        lastDot !== -1 ? originalFilename.substring(lastDot + 1) : "";
      publicId =
        lastDot !== -1
          ? originalFilename.substring(0, lastDot)
          : originalFilename;
    }

    const uploadOptions = {
      folder,
      resource_type,
      use_filename: true,
      unique_filename: true,
      access_mode: "public",
      eager: [
        {
          streaming_profile: "full_hd",
          format: "m3u8",
        },
      ],
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

const determineCoursesStatus = (startDate, endDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < today) {
    return "Terminado";
  } else if (start <= today && end >= today) {
    return "Em curso";
  } else if (start > today) {
    return "Ativo";
  }

  return "Ativo";
};

const getCursos = async (_, res) => {
  try {
    const cursos = await Curso.findAll({
      include: [
        {
          model: Area,
          attributes: ["NOME"],
          include: [
            {
              model: Categoria,
              as: "Categoria",
              attributes: ["ID_CATEGORIA__PK___", "NOME__"],
            },
          ],
        },
        {
          model: CursoAssincrono,
          required: false,
        },
        {
          model: CursoSincrono,
          required: false,
          include: [
            {
              model: Utilizador,
              attributes: ["USERNAME", "NOME"],
            },
          ],
        },
      ],
    });
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao procurar os cursos:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCursoById = async (req, res) => {
  const { id } = req.params;

  try {
    const curso = await Curso.findByPk(id, {
      include: [
        {
          model: Area,
          as: "AREA",
          attributes: ["NOME", "ID_AREA"],
          include: [
            {
              model: Categoria,
              as: "Categoria",
              attributes: ["ID_CATEGORIA__PK___", "NOME__"],
            },
          ],
        },
        {
          model: Topico,
          as: "Topico",
          attributes: ["ID_TOPICO", "TITULO", "DESCRICAO"],
        },
        {
          model: CursoAssincrono,
          attributes: ["DATA_INICIO", "DATA_FIM", "NUMERO_CURSOS_ASSINCRONOS"],
        },
        {
          model: CursoSincrono,
          attributes: [
            "DATA_INICIO",
            "DATA_FIM",
            "VAGAS",
            "ID_UTILIZADOR",
            "DATA_LIMITE_INSCRICAO_S",
          ],
          include: [
            {
              model: ConteudoSincrono,
              required: false,
            },
            {
              model: Utilizador,
              attributes: ["ID_UTILIZADOR", "USERNAME", "NOME", "LINKEDIN"],
            },
          ],
        },
        {
          model: Objetivos,
          attributes: ["ID_OBJETIVO", "DESCRICAO"],
          as: "OBJETIVOS",
        },
        {
          model: Habilidades,
          attributes: ["ID_HABILIDADE", "DESCRICAO"],
          as: "HABILIDADES",
        },
        {
          model: Modulos,
          attributes: [
            "ID_MODULO",
            "NOME",
            "DESCRICAO",
            "TEMPO_ESTIMADO_MIN",
            "VIDEO_URL",
            "FILE_URL",
          ],
          as: "MODULOS",
          order: [["ID_MODULO", "ASC"]],
        },
        {
          model: QuizAssincrono,
          as: "QUIZ_ASSINCRONO",
          required: false,
          attributes: [
            "ID_QUIZ",
            "TITULO",
            "DESCRICAO",
            "TEMPO_LIMITE_MIN",
            "NOTA_MINIMA",
            "ATIVO",
            "DATA_CRIACAO",
          ],
          include: [
            {
              model: Utilizador,
              as: "CRIADOR",
              attributes: ["NOME", "USERNAME"],
            },
          ],
        },
      ],
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    const cursoProcesado = curso.toJSON();

    if (cursoProcesado.MODULOS) {
      cursoProcesado.MODULOS = cursoProcesado.MODULOS.map((modulo) => {
        let fileUrls = [];
        if (modulo.FILE_URL) {
          try {
            if (
              typeof modulo.FILE_URL === "string" &&
              modulo.FILE_URL.startsWith("[")
            ) {
              fileUrls = JSON.parse(modulo.FILE_URL);
            } else if (typeof modulo.FILE_URL === "string") {
              fileUrls = [modulo.FILE_URL];
            } else if (Array.isArray(modulo.FILE_URL)) {
              fileUrls = modulo.FILE_URL;
            }
          } catch (e) {
            console.warn(
              `Erro ao processar FILE_URL do módulo ${modulo.NOME}:`,
              e
            );
            fileUrls = [];
          }
        }

        return {
          ...modulo,
          FILE_URL_ARRAY: fileUrls,
          HAS_VIDEO: !!modulo.VIDEO_URL,
          HAS_CONTENT: fileUrls.length > 0,
          VIDEO_TYPE: modulo.VIDEO_URL
            ? modulo.VIDEO_URL.includes("youtube.com")
              ? "youtube"
              : "upload"
            : null,
        };
      });
    }
    cursoProcesado.HAS_QUIZ = !!cursoProcesado.QUIZ_ASSINCRONO;

    console.log(
      `Curso ${id} encontrado com ${cursoProcesado.MODULOS?.length || 0} módulos`
    );

    res.status(200).json(cursoProcesado);
  } catch (error) {
    console.error(`Erro ao procurar curso com id ${id}:`, error);
    res
      .status(500)
      .json({ error: "Erro ao procurar curso", details: error.message });
  }
};

const getCursosPopulares = async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      include: [
        {
          model: Area,
          attributes: ["NOME"],
        },
        {
          model: CursoAssincrono,
          where: {
            ESTADO: ["Ativo", "Em curso"],
          },
          required: false,
        },
        {
          model: CursoSincrono,
          where: {
            ESTADO: ["Ativo", "Em curso"],
          },
          attributes: ["VAGAS", "DATA_INICIO", "DATA_FIM", "ESTADO"],
          required: false,
        },
      ],
      where: {
        [Op.or]: [
          { "$CURSO_ASSINCRONO.ESTADO$": ["Ativo", "Em curso"] },
          { "$CURSO_SINCRONO.ESTADO$": "Ativo" },
        ],
      },
      limit: 8,
    });

    const cursosComReviews = await Promise.all(
      cursos.map(async (curso) => {
        const cursoData = curso.toJSON();

        try {
          const reviewStats = await sequelize.query(
            `
            SELECT 
              AVG("ESTRELAS") as "averageRating",
              COUNT("ID_REVIEW") as "totalReviews"
            FROM "REVIEW"
            WHERE "ID_CURSO" = :cursoId
          `,
            {
              replacements: { cursoId: curso.ID_CURSO },
              type: sequelize.QueryTypes.SELECT,
            }
          );

          const stats = reviewStats[0] || {};
          cursoData.averageRating = parseFloat(stats.averageRating) || 0;
          cursoData.totalReviews = parseInt(stats.totalReviews) || 0;
        } catch (error) {
          console.warn(
            `Erro ao procurar reviews para curso ${curso.ID_CURSO}:`,
            error
          );
          cursoData.averageRating = 0;
          cursoData.totalReviews = 0;
        }

        return cursoData;
      })
    );

    res.status(200).json(cursosComReviews);
  } catch (error) {
    console.error("Erro ao procurar os cursos populares:", error);
    res.status(500).json({ message: error.message });
  }
};

const verifyTeacher = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.ID_UTILIZADOR;

  try {
    const curso = await Curso.findByPk(courseId);
    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso não encontrado",
        isTeacher: false,
      });
    }

    const cursoSincrono = await CursoSincrono.findOne({
      where: { ID_CURSO: courseId },
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
      ],
    });

    if (!cursoSincrono) {
      return res.status(200).json({
        success: true,
        message: "Curso assíncrono - sem formador específico",
        isTeacher: false,
        courseType: "assincrono",
      });
    }

    const isTeacher = cursoSincrono.ID_UTILIZADOR === userId;

    res.status(200).json({
      success: true,
      isTeacher: isTeacher,
      courseType: "sincrono",
    });
  } catch (error) {
    console.error("Erro ao verificar formador:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      isTeacher: false,
    });
  }
};

const createCurso = async (req, res) => {
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    ID_TOPICO,
    HABILIDADES,
    OBJETIVOS,
  } = req.body;

  const modulos = JSON.parse(req.body.MODULOS);

  try {
    let imagemUrl = null;
    let imagemPublicId = null;

    if (req.file) {
      const result = await streamUpload(
        req.file.buffer,
        `cursos/${NOME}`,
        "auto"
      );

      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }

    const curso = await Curso.create({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      IMAGEM: imagemUrl,
      IMAGEM_PUBLIC_ID: imagemPublicId,
      ID_AREA,
      ID_TOPICO,
      DATA_CRIACAO__: new Date(),
    });

    const habilidadesArray = HABILIDADES.split(",").map((habilidade) => {
      return { DESCRICAO: habilidade.trim() };
    });

    const objetivosArray = OBJETIVOS.split(",").map((objetivo) => {
      return { DESCRICAO: objetivo.trim() };
    });

    await Promise.all([
      Habilidades.bulkCreate(
        habilidadesArray.map((habilidade) => ({
          ...habilidade,
          ID_CURSO: curso.ID_CURSO,
        }))
      ),
      Objetivos.bulkCreate(
        objetivosArray.map((objetivo) => ({
          ...objetivo,
          ID_CURSO: curso.ID_CURSO,
        }))
      ),
    ]);

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );
      const contentFile = req.files.find(
        (file) => file.fieldname === `module_${i}_content`
      );

      let videoUrl = null;
      let contentUrl = null;

      if (videoFile) {
        const result = await cloudinary.uploader.upload(videoFile.path, {
          resource_type: "video",
          folder: `cursos/${NOME}/modulos/videos`,
        });

        videoUrl = result.secure_url;
      }

      if (contentFile) {
        const result = await cloudinary.uploader.upload(contentFile.path, {
          resource_type: "raw",
          folder: `cursos/${NOME}/modulos/conteudos`,
        });

        contentUrl = result.secure_url;
      }

      await Modulos.create({
        ID_CURSO: curso.ID_CURSO,
        NOME: modulo.NOME,
        DESCRICAO: modulo.DESCRICAO,
        VIDEO_URL: videoUrl,
        FILE_URL: contentUrl,
        TEMPO_ESTIMADO_MIN: modulo.DURACAO,
      });
    }

    res.status(201).json({
      message: "Curso criado com sucesso",
      Curso: curso,
      HABILIDADES: habilidadesArray,
      OBJETIVOS: objetivosArray,
      MODULOS: modulos,
    });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCurso = async (req, res) => {
  const { id } = req.params;
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    ID_TOPICO,
  } = req.body;

  try {
    const curso = await Curso.findByPk(id);

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    const cursoExistente = await Curso.findOne({
      where: {
        NOME,
        DESCRICAO_OBJETIVOS__,
        DIFICULDADE_CURSO__,
        ID_AREA,
      },
    });

    let imagemUrl = curso.IMAGEM;
    let imagemPublicId = curso.IMAGEM_PUBLIC_ID;

    if (req.file) {
      const result = cloudinary.uploader.upload_stream(
        { folder: "cursos" },
        (error, result) => {
          if (error) throw error;
          return result;
        }
      );
      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }

    await curso.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      IMAGEM: imagemUrl,
      IMAGEM_PUBLIC_ID: imagemPublicId,
      ID_AREA,
      ID_TOPICO,
    });

    res.status(200).json(curso);
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCursoSincrono = async (req, res) => {
  const { id } = req.params;
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    ID_UTILIZADOR,
    DATA_INICIO,
    DATA_FIM,
    VAGAS,
    HABILIDADES,
    OBJETIVOS,
    DATA_LIMITE_INSCRICAO,
    ID_TOPICO,
  } = req.body;

  try {
    const curso = await Curso.findByPk(id);
    const cursoSincrono = await CursoSincrono.findOne({
      where: { ID_CURSO: id },
      include: [{ model: Utilizador, attributes: ["NOME", "USERNAME"] }],
    });

    if (!curso || !cursoSincrono) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    let formadorAlterado = false;
    let datasAlteradas = false;
    let emailData = {};

    if (ID_UTILIZADOR && ID_UTILIZADOR !== cursoSincrono.ID_UTILIZADOR) {
      formadorAlterado = true;
      const formadorAnterior =
        cursoSincrono.UTILIZADOR?.NOME ||
        cursoSincrono.UTILIZADOR?.USERNAME ||
        "Não definido";
      const novoFormador = await Utilizador.findByPk(ID_UTILIZADOR);

      emailData.formadorAnterior = formadorAnterior;
      emailData.novoFormador =
        novoFormador?.NOME || novoFormador?.USERNAME || "Não definido";
    }

    if (
      (DATA_INICIO && DATA_INICIO !== cursoSincrono.DATA_INICIO) ||
      (DATA_FIM && DATA_FIM !== cursoSincrono.DATA_FIM)
    ) {
      datasAlteradas = true;

      emailData.dataAnteriorInicio = cursoSincrono.DATA_INICIO;
      emailData.dataAnteriorFim = cursoSincrono.DATA_FIM;
      emailData.novaDataInicio = DATA_INICIO || cursoSincrono.DATA_INICIO;
      emailData.novaDataFim = DATA_FIM || cursoSincrono.DATA_FIM;
      emailData.formador =
        emailData.novoFormador ||
        cursoSincrono.UTILIZADOR?.NOME ||
        cursoSincrono.UTILIZADOR?.USERNAME ||
        "Não definido";
    }

    await curso.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      ID_AREA,
      ID_TOPICO,
    });

    await cursoSincrono.update({
      ID_UTILIZADOR,
      DATA_INICIO,
      DATA_FIM,
      VAGAS,
      DATA_LIMITE_INSCRICAO_S: DATA_LIMITE_INSCRICAO,
    });

    if (formadorAlterado) {
      await notifyAllEnrolled(
        id,
        "Alteração de Formador",
        `O formador do curso ${curso.NOME} foi alterado para ${emailData.novoFormador}.`,
        "ALTERACAO_FORMADOR",
        emailData
      );
    }

    if (datasAlteradas) {
      const novaDataInicio = new Date(
        emailData.novaDataInicio
      ).toLocaleDateString("pt-PT");
      const novaDataFim = new Date(emailData.novaDataFim).toLocaleDateString(
        "pt-PT"
      );

      let mensagem = `As datas do curso ${curso.NOME} foram alteradas.`;
      if (emailData.novaDataInicio)
        mensagem += ` Nova data de início: ${novaDataInicio}.`;
      if (emailData.novaDataFim)
        mensagem += ` Nova data de fim: ${novaDataFim}.`;

      await notifyAllEnrolled(
        id,
        "Alteração de Datas",
        mensagem,
        "ALTERACAO_DATA",
        emailData
      );
    }

    res.status(200).json({
      "Curso: ": curso,
      "Curso Sincrono: ": cursoSincrono,
    });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCursoAssincrono = async (req, res) => {
  const { id } = req.params;
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    DATA_INICIO,
    DATA_FIM,
    HABILIDADES,
    OBJETIVOS,
    ID_TOPICO,
  } = req.body;

  const modulos = JSON.parse(req.body.MODULOS);

  try {
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    let imagemUrl = curso.IMAGEM;
    let imagemPublicId = curso.IMAGEM_PUBLIC_ID;
    const imagem = req.files.find((file) => file.fieldname === "imagem");
    if (imagem) {
      const result = await streamUpload(
        imagem.buffer,
        `cursos/${NOME}`,
        "auto"
      );
      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }
    await curso.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      IMAGEM: imagemUrl,
      IMAGEM_PUBLIC_ID: imagemPublicId,
      ID_AREA,
      ID_TOPICO,
      DATA_CRIACAO__: new Date(),
    });
    const cursoAssincrono = await CursoAssincrono.findOne({
      where: {
        ID_CURSO: id,
      },
    });
    if (!cursoAssincrono) {
      return res.status(404).json({ error: "Curso Assincrono não encontrado" });
    }

    let datasAlteradas = false;
    let emailData = {};

    if (
      (DATA_INICIO && DATA_INICIO !== cursoAssincrono.DATA_INICIO) ||
      (DATA_FIM && DATA_FIM !== cursoAssincrono.DATA_FIM)
    ) {
      datasAlteradas = true;

      emailData.dataAnteriorInicio = cursoAssincrono.DATA_INICIO;
      emailData.dataAnteriorFim = cursoAssincrono.DATA_FIM;
      emailData.novaDataInicio = DATA_INICIO || cursoAssincrono.DATA_INICIO;
      emailData.novaDataFim = DATA_FIM || cursoAssincrono.DATA_FIM;
      emailData.formador = "Curso Assíncrono";
    }

    const habilidadesArray = HABILIDADES.split(",").map((habilidade) => {
      return { DESCRICAO: habilidade.trim() };
    });

    const objetivosArray = OBJETIVOS.split(",").map((objetivo) => {
      return { DESCRICAO: objetivo.trim() };
    });

    await Habilidades.destroy({
      where: { ID_CURSO: curso.ID_CURSO },
    });

    await Objetivos.destroy({
      where: { ID_CURSO: curso.ID_CURSO },
    });

    await Promise.all([
      Habilidades.bulkCreate(
        habilidadesArray.map((habilidade) => ({
          ...habilidade,
          ID_CURSO: curso.ID_CURSO,
        }))
      ),
      Objetivos.bulkCreate(
        objetivosArray.map((objetivo) => ({
          ...objetivo,
          ID_CURSO: curso.ID_CURSO,
        }))
      ),
    ]);

    await Modulos.destroy({
      where: { ID_CURSO: curso.ID_CURSO },
    });

    let novosModulosAdicionados = false;
    let conteudoInfo = "";

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );
      const contentFile = req.files.find(
        (file) => file.fieldname === `module_${i}_content`
      );

      let videoUrl = null;
      let contentUrl = null;

      if (videoFile) {
        const result = await streamUpload(
          videoFile.buffer,
          `cursos/${NOME}/modulos/videos`,
          "auto"
        );

        videoUrl = result.secure_url;
        novosModulosAdicionados = true;
      }

      if (contentFile) {
        const result = await streamUpload(
          contentFile.buffer,
          `cursos/${NOME}/modulos/conteudos`,
          "auto"
        );

        contentUrl = result.secure_url;
        novosModulosAdicionados = true;
      }

      await Modulos.create({
        ID_CURSO: curso.ID_CURSO,
        NOME: modulo.NOME,
        DESCRICAO: modulo.DESCRICAO,
        VIDEO_URL: videoUrl,
        FILE_URL: contentUrl,
        TEMPO_ESTIMADO_MIN: modulo.DURACAO,
      });
    }

    if (novosModulosAdicionados) {
      conteudoInfo = `Novos módulos adicionados:<br>`;
      modulos.forEach((modulo) => {
        conteudoInfo += `• <strong>${modulo.NOME}</strong><br>`;
      });
    }

    const today = new Date();
    const novaDataInicio = DATA_INICIO
      ? new Date(DATA_INICIO)
      : cursoAssincrono.DATA_INICIO;
    const novaDataFim = DATA_FIM
      ? new Date(DATA_FIM)
      : cursoAssincrono.DATA_FIM;

    let novoEstado;
    if (novaDataFim < today) {
      novoEstado = "Terminado";
    } else if (novaDataInicio <= today && novaDataFim >= today) {
      novoEstado = "Em curso";
    } else if (novaDataInicio > today) {
      novoEstado = "Brevemente";
    }

    await cursoAssincrono.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      ID_AREA,
      DATA_INICIO,
      DATA_FIM,
      ESTADO: novoEstado,
    });

    if (datasAlteradas) {
      const novaDataInicioFormatada = new Date(
        emailData.novaDataInicio
      ).toLocaleDateString("pt-PT");
      const novaDataFimFormatada = new Date(
        emailData.novaDataFim
      ).toLocaleDateString("pt-PT");

      let mensagem = `As datas do curso assíncrono ${curso.NOME} foram alteradas.`;
      if (emailData.novaDataInicio)
        mensagem += ` Nova data de início: ${novaDataInicioFormatada}.`;
      if (emailData.novaDataFim)
        mensagem += ` Nova data de fim: ${novaDataFimFormatada}.`;

      await notifyAllEnrolled(
        id,
        "Alteração de Datas",
        mensagem,
        "ALTERACAO_DATA",
        emailData
      );
    }

    if (novosModulosAdicionados) {
      await notifyAllEnrolled(
        id,
        "Novo Conteúdo Disponível",
        `Novos módulos foram adicionados ao curso ${curso.NOME}. Confira o novo conteúdo disponível!`,
        "NOVO_CONTEUDO",
        { conteudoInfo }
      );
    }

    res.status(200).json({
      Curso: curso,
      CursoAssincrono: cursoAssincrono,
      HABILIDADES: habilidadesArray,
      OBJETIVOS: objetivosArray,
      MODULOS: Modulos,
    });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCursoCompleto = async (req, res) => {
  const { id } = req.params;
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    DATA_INICIO,
    DATA_FIM,
    HABILIDADES,
    OBJETIVOS,
    ID_TOPICO,
    ID_UTILIZADOR,
    VAGAS,
    DATA_LIMITE_INSCRICAO,
  } = req.body;

  let transaction;

  try {
    transaction = await sequelize.transaction();

    const curso = await Curso.findByPk(id, { transaction });
    if (!curso) {
      await transaction.rollback();
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    const modulosExistentes = await Modulos.findAll({
      where: { ID_CURSO: curso.ID_CURSO },
      transaction,
      order: [["ID_MODULO", "ASC"]],
    });

    const cursoSincrono = await CursoSincrono.findOne({
      where: { ID_CURSO: id },
      transaction,
    });

    let formador = "";

    if (cursoSincrono) {
      const user = await Utilizador.findByPk(cursoSincrono.ID_UTILIZADOR, {
        transaction,
      });
      formador = user?.NOME || user?.USERNAME;
    }

    const cursoAssincrono = await CursoAssincrono.findOne({
      where: { ID_CURSO: id },
      transaction,
    });

    let formadorAlterado = false;
    let datasAlteradas = false;
    let emailData = {};

    if (
      cursoSincrono &&
      ID_UTILIZADOR &&
      parseInt(ID_UTILIZADOR) !== parseInt(cursoSincrono.ID_UTILIZADOR)
    ) {
      formadorAlterado = true;
      const formadorAnterior = await Utilizador.findByPk(
        cursoSincrono.ID_UTILIZADOR,
        { transaction }
      );
      const novoFormador = await Utilizador.findByPk(ID_UTILIZADOR, {
        transaction,
      });

      emailData.formadorAnterior =
        formadorAnterior?.NOME || formadorAnterior?.USERNAME || "Sem formador";
      emailData.novoFormador =
        novoFormador?.NOME || novoFormador?.USERNAME || "Não definido";
    }

    const dataAnteriorInicio =
      cursoSincrono?.DATA_INICIO || cursoAssincrono?.DATA_INICIO;
    const dataAnteriorFim =
      cursoSincrono?.DATA_FIM || cursoAssincrono?.DATA_FIM;

    const dataInicioString = DATA_INICIO
      ? new Date(DATA_INICIO).toISOString().split("T")[0]
      : null;
    const dataFimString = DATA_FIM
      ? new Date(DATA_FIM).toISOString().split("T")[0]
      : null;
    const dataAnteriorInicioString = dataAnteriorInicio
      ? new Date(dataAnteriorInicio).toISOString().split("T")[0]
      : null;
    const dataAnteriorFimString = dataAnteriorFim
      ? new Date(dataAnteriorFim).toISOString().split("T")[0]
      : null;

    if (
      (dataInicioString && dataInicioString !== dataAnteriorInicioString) ||
      (dataFimString && dataFimString !== dataAnteriorFimString)
    ) {
      datasAlteradas = true;

      emailData.dataAnteriorInicio = dataAnteriorInicio;
      emailData.dataAnteriorFim = dataAnteriorFim;
      emailData.novaDataInicio = DATA_INICIO || dataAnteriorInicio;
      emailData.novaDataFim = DATA_FIM || dataAnteriorFim;
      emailData.formador = cursoSincrono
        ? emailData.novoFormador ||
          (formador !== "" ? formador : "Não definido") ||
          "Não definido"
        : "Curso Assíncrono";
    }

    let imagemUrl = curso.IMAGEM;
    let imagemPublicId = curso.IMAGEM_PUBLIC_ID;

    const imagem = req.files?.find((file) => file.fieldname === "imagem");
    if (imagem) {
      const result = await streamUpload(
        imagem.buffer,
        `cursos/${NOME}`,
        "auto"
      );
      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }

    await curso.update(
      {
        NOME,
        DESCRICAO_OBJETIVOS__,
        DIFICULDADE_CURSO__,
        IMAGEM: imagemUrl,
        IMAGEM_PUBLIC_ID: imagemPublicId,
        ID_AREA,
        ID_TOPICO,
      },
      { transaction }
    );

    if (HABILIDADES && OBJETIVOS) {
      const habilidadesArray = HABILIDADES.split(",")
        .map((habilidade) => ({ DESCRICAO: habilidade.trim() }))
        .filter((h) => h.DESCRICAO);

      const objetivosArray = OBJETIVOS.split(",")
        .map((objetivo) => ({ DESCRICAO: objetivo.trim() }))
        .filter((o) => o.DESCRICAO);

      await Promise.all([
        Habilidades.destroy({
          where: { ID_CURSO: curso.ID_CURSO },
          transaction,
        }),
        Objetivos.destroy({ where: { ID_CURSO: curso.ID_CURSO }, transaction }),
      ]);

      await Promise.all([
        Habilidades.bulkCreate(
          habilidadesArray.map((habilidade) => ({
            ...habilidade,
            ID_CURSO: curso.ID_CURSO,
          })),
          { transaction }
        ),
        Objetivos.bulkCreate(
          objetivosArray.map((objetivo) => ({
            ...objetivo,
            ID_CURSO: curso.ID_CURSO,
          })),
          { transaction }
        ),
      ]);
    }

    let conteudoInfo = "";
    let novosModulosAdicionados = false;
    const modulosParaManter = new Set();
    const modulosAtualizados = [];
    const modulosParaCriar = [];

    if (req.body.MODULOS) {
      const modulosNovos = JSON.parse(req.body.MODULOS);
      console.log(`📝 Processando ${modulosNovos.length} módulos novos`);

      const mapaModulosExistentes = new Map();
      modulosExistentes.forEach((modulo) => {
        mapaModulosExistentes.set(modulo.NOME.toLowerCase().trim(), modulo);
      });

      for (let i = 0; i < modulosNovos.length; i++) {
        const moduloNovo = modulosNovos[i];
        const nomeModulo = moduloNovo.NOME.toLowerCase().trim();
        const moduloExistente = mapaModulosExistentes.get(nomeModulo);

        const videoFile = req.files?.find(
          (file) => file.fieldname === `module_${i}_video`
        );
        const contentFiles =
          req.files?.filter((file) =>
            file.fieldname.startsWith(`module_${i}_content_`)
          ) || [];

        let videoUrl = null;
        let contentUrls = [];

        if (videoFile) {
          const result = await streamUpload(
            videoFile.buffer,
            `cursos/${NOME}/modulos/videos`,
            "video"
          );
          videoUrl = result.secure_url;
          novosModulosAdicionados = true;
        } else if (moduloNovo.VIDEO_URL) {
          videoUrl = moduloNovo.VIDEO_URL;
        } else if (moduloExistente?.VIDEO_URL) {
          videoUrl = moduloExistente.VIDEO_URL;
        }

        if (contentFiles.length > 0) {
          for (const contentFile of contentFiles) {
            try {
              const result = await saveFileToSupabase(
                contentFile.buffer,
                contentFile.originalname,
                `course-update-${curso.ID_CURSO}`
              );
              contentUrls.push(result.url);
              novosModulosAdicionados = true;
            } catch (error) {
              console.error("❌ Erro ao upload do arquivo:", error);
            }
          }
        } else if (moduloExistente?.FILE_URL) {
          try {
            const existingUrls = JSON.parse(moduloExistente.FILE_URL);
            contentUrls = Array.isArray(existingUrls) ? existingUrls : [];
          } catch (e) {
            contentUrls = [];
          }
        }

        if (moduloExistente) {
          modulosParaManter.add(moduloExistente.ID_MODULO);

          const dadosAtualizacao = {
            NOME: moduloNovo.NOME,
            DESCRICAO: moduloNovo.DESCRICAO,
            TEMPO_ESTIMADO_MIN: moduloNovo.DURACAO,
          };

          if (videoUrl !== moduloExistente.VIDEO_URL) {
            dadosAtualizacao.VIDEO_URL = videoUrl;
          }

          const contentUrlsString = JSON.stringify(contentUrls);
          if (contentUrlsString !== moduloExistente.FILE_URL) {
            dadosAtualizacao.FILE_URL = contentUrlsString;
          }

          modulosAtualizados.push({
            id: moduloExistente.ID_MODULO,
            dados: dadosAtualizacao,
          });

          console.log(
            `🔄 Módulo "${moduloNovo.NOME}" será atualizado (ID: ${moduloExistente.ID_MODULO})`
          );
        } else {
          modulosParaCriar.push({
            ID_CURSO: curso.ID_CURSO,
            NOME: moduloNovo.NOME,
            DESCRICAO: moduloNovo.DESCRICAO,
            VIDEO_URL: videoUrl,
            FILE_URL: JSON.stringify(contentUrls),
            TEMPO_ESTIMADO_MIN: moduloNovo.DURACAO,
          });

          novosModulosAdicionados = true;
          console.log(`➕ Módulo "${moduloNovo.NOME}" será criado`);
        }
      }

      for (const modulo of modulosAtualizados) {
        await Modulos.update(modulo.dados, {
          where: { ID_MODULO: modulo.id },
          transaction,
        });
        console.log(`✅ Módulo ${modulo.id} atualizado`);
      }

      if (modulosParaCriar.length > 0) {
        await Modulos.bulkCreate(modulosParaCriar, { transaction });
        console.log(`✅ ${modulosParaCriar.length} novos módulos criados`);
      }

      const modulosParaDeletar = modulosExistentes.filter(
        (modulo) => !modulosParaManter.has(modulo.ID_MODULO)
      );

      if (modulosParaDeletar.length > 0) {
        console.log(
          `⚠️ ATENÇÃO: ${modulosParaDeletar.length} módulos serão removidos:`,
          modulosParaDeletar.map((m) => `"${m.NOME}" (ID: ${m.ID_MODULO})`)
        );

        for (const modulo of modulosParaDeletar) {
          await ProgressoModulo.destroy({
            where: { ID_MODULO: modulo.ID_MODULO },
            transaction,
          });
          console.log(
            `🗑️ Progresso removido do módulo "${modulo.NOME}" (ID: ${modulo.ID_MODULO})`
          );
        }

        await Modulos.destroy({
          where: {
            ID_MODULO: modulosParaDeletar.map((m) => m.ID_MODULO),
          },
          transaction,
        });
        console.log(`🗑️ ${modulosParaDeletar.length} módulos removidos`);
      }

      if (novosModulosAdicionados) {
        conteudoInfo = `Conteúdo atualizado:<br>`;
        modulosNovos.forEach((modulo) => {
          conteudoInfo += `• <strong>${modulo.NOME}</strong><br>`;
        });
      }
    }

    if (cursoSincrono) {
      const today = new Date();
      const novaDataInicio = DATA_INICIO
        ? new Date(DATA_INICIO)
        : cursoSincrono.DATA_INICIO;
      const novaDataFim = DATA_FIM
        ? new Date(DATA_FIM)
        : cursoSincrono.DATA_FIM;

      let novoEstado = cursoSincrono.ESTADO;

      if (novaDataFim < today) {
        novoEstado = "Terminado";
      } else if (novaDataInicio <= today && novaDataFim >= today) {
        novoEstado = "Em curso";
      } else if (novaDataInicio > today) {
        novoEstado = "Ativo";
      }
      await cursoSincrono.update(
        {
          ID_UTILIZADOR: ID_UTILIZADOR || cursoSincrono.ID_UTILIZADOR,
          VAGAS: VAGAS || cursoSincrono.VAGAS,
          DATA_INICIO: DATA_INICIO || cursoSincrono.DATA_INICIO,
          DATA_FIM: DATA_FIM || cursoSincrono.DATA_FIM,
          DATA_LIMITE_INSCRICAO_S:
            DATA_LIMITE_INSCRICAO || cursoSincrono.DATA_LIMITE_INSCRICAO_S,
          ESTADO: novoEstado,
        },
        { transaction }
      );
    }

    if (cursoAssincrono) {
      const today = new Date();
      const novaDataInicio = DATA_INICIO
        ? new Date(DATA_INICIO)
        : cursoAssincrono.DATA_INICIO;
      const novaDataFim = DATA_FIM
        ? new Date(DATA_FIM)
        : cursoAssincrono.DATA_FIM;

      let novoEstado = "Inativo";
      if (novaDataInicio <= today && novaDataFim >= today) {
        novoEstado = "Ativo";
      }
      await cursoAssincrono.update(
        {
          DATA_INICIO: DATA_INICIO || cursoAssincrono.DATA_INICIO,
          DATA_FIM: DATA_FIM || cursoAssincrono.DATA_FIM,
          ESTADO: novoEstado,
        },
        { transaction }
      );
    }

    await transaction.commit();
    transaction = null;

    if (formadorAlterado) {
      await notifyAllEnrolled(
        id,
        "Alteração de Formador",
        `O formador do curso ${curso.NOME} foi alterado para ${emailData.novoFormador}.`,
        "ALTERACAO_FORMADOR",
        emailData
      );
    }

    if (datasAlteradas) {
      const novaDataInicio = new Date(
        emailData.novaDataInicio
      ).toLocaleDateString("pt-PT");
      const novaDataFim = new Date(emailData.novaDataFim).toLocaleDateString(
        "pt-PT"
      );

      let mensagem = `As datas do curso ${curso.NOME} foram alteradas.`;
      if (emailData.novaDataInicio)
        mensagem += ` Nova data de início: ${novaDataInicio}.`;
      if (emailData.novaDataFim)
        mensagem += ` Nova data de fim: ${novaDataFim}.`;

      await notifyAllEnrolled(
        id,
        "Alteração de Datas",
        mensagem,
        "ALTERACAO_DATA",
        emailData
      );
    }

    if (novosModulosAdicionados) {
      await notifyAllEnrolled(
        id,
        "Conteúdo Atualizado",
        `O conteúdo do curso ${curso.NOME} foi atualizado com novos módulos!`,
        "NOVO_CONTEUDO",
        { conteudoInfo }
      );
    }

    res.status(200).json({
      success: true,
      message: "Curso atualizado com sucesso",
      curso: curso,
      modulosInfo: {
        existentes: modulosExistentes.length,
        atualizados: modulosAtualizados?.length || 0,
        criados: modulosParaCriar?.length || 0,
        removidos:
          (modulosExistentes.length || 0) - (modulosParaManter?.size || 0),
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Erro ao atualizar curso:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar curso",
      error: error.message,
    });
  }
};

const createAssincrono = async (req, res) => {
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    DATA_FIM,
    DATA_INICIO,
    HABILIDADES,
    OBJETIVOS,
    ID_TOPICO,
  } = req.body;

  const modulos = JSON.parse(req.body.MODULOS);

  try {
    let imagemUrl = null;
    let imagemPublicId = null;

    const imagem = req.files.find((file) => file.fieldname === "imagem");

    if (imagem) {
      const result = await streamUpload(
        imagem.buffer,
        `cursos/${NOME}`,
        "auto"
      );
      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }

    const curso = await Curso.create({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      IMAGEM: imagemUrl,
      IMAGEM_PUBLIC_ID: imagemPublicId,
      ID_AREA,
      ID_TOPICO,
      DATA_CRIACAO__: new Date(),
    });

    const NUMERO_CURSOS_ASSINCRONOS = await CursoAssincrono.count();
    const ADD_COURSE = NUMERO_CURSOS_ASSINCRONOS + 1;

    const habilidadesArray = HABILIDADES.split(",").map((habilidade) => {
      return { DESCRICAO: habilidade.trim() };
    });

    const objetivosArray = OBJETIVOS.split(",").map((objetivo) => {
      return { DESCRICAO: objetivo.trim() };
    });

    await Promise.all([
      Habilidades.bulkCreate(
        habilidadesArray.map((habilidade) => ({
          ...habilidade,
          ID_CURSO: curso.ID_CURSO,
        }))
      ),
      Objetivos.bulkCreate(
        objetivosArray.map((objetivo) => ({
          ...objetivo,
          ID_CURSO: curso.ID_CURSO,
        }))
      ),
    ]);

    const uploadedFiles = [];

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );

      const contentFiles = req.files.filter((file) => {
        return file.fieldname.startsWith(`module_${i}_content_`);
      });

      let videoUrl = null;
      let contentUrls = [];

      const hasVideoFile = videoFile ? true : false;
      const hasVideoURL = modulo.VIDEO_URL ? true : false;
      const hasContentFiles = contentFiles && contentFiles.length > 0;

      if (!hasVideoFile && !hasVideoURL && !hasContentFiles) {
        console.warn(
          `Módulo "${modulo.NOME}" não tem conteúdo. Criando apenas estrutura...`
        );

        await Modulos.create({
          ID_CURSO: curso.ID_CURSO,
          NOME: modulo.NOME,
          DESCRICAO: modulo.DESCRICAO,
          VIDEO_URL: null,
          FILE_URL: JSON.stringify([]),
          TEMPO_ESTIMADO_MIN: modulo.DURACAO,
        });

        continue;
      }

      if (videoFile) {
        const result = await streamUpload(
          videoFile.buffer,
          `cursos/${NOME}/modulos/videos`,
          "video"
        );
        videoUrl = result.secure_url;

        uploadedFiles.push({
          originalname: videoFile.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          type: "video_upload",
          module: modulo.NOME,
        });

        console.log(
          `Vídeo uploaded para módulo ${modulo.NOME}: ${result.secure_url}`
        );
      } else if (modulo.VIDEO_URL) {
        videoUrl = modulo.VIDEO_URL;

        uploadedFiles.push({
          url: modulo.VIDEO_URL,
          type: "video_youtube",
          module: modulo.NOME,
        });

        console.log(
          `URL do YouTube para módulo ${modulo.NOME}: ${modulo.VIDEO_URL}`
        );
      }

      if (contentFiles && contentFiles.length > 0) {
        for (const contentFile of contentFiles) {
          try {
            const result = await saveFileToSupabase(
              contentFile.buffer,
              contentFile.originalname,
              "course-async"
            );
            contentUrls.push(result.url);

            uploadedFiles.push({
              originalname: contentFile.originalname,
              url: result.url,
              path: result.path,
              type: "document",
              module: modulo.NOME,
            });
          } catch (error) {
            console.error("Error uploading file:", error);
          }
        }
      }

      await Modulos.create({
        ID_CURSO: curso.ID_CURSO,
        NOME: modulo.NOME,
        DESCRICAO: modulo.DESCRICAO,
        VIDEO_URL: videoUrl,
        FILE_URL: JSON.stringify(contentUrls),
        TEMPO_ESTIMADO_MIN: modulo.DURACAO,
      });

      console.log(
        `Módulo criado: ${modulo.NOME} com conteúdo: ${
          videoUrl || contentUrls.length > 0 ? "SIM" : "Apenas descrição"
        }`
      );
    }

    const novoEstado = determineCoursesStatus(DATA_INICIO, DATA_FIM);

    const cursoAssincrono = await CursoAssincrono.create({
      ID_CURSO: curso.ID_CURSO,
      NUMERO_CURSOS_ASSINCRONOS: ADD_COURSE,
      DATA_INICIO,
      DATA_FIM,
      ESTADO: novoEstado,
    });

    res.status(201).json({
      success: true,
      message: "Curso assíncrono criado com sucesso!",
      Curso: curso,
      "Curso Assincrono": cursoAssincrono,
      HABILIDADES: habilidadesArray,
      OBJETIVOS: objetivosArray,
      MODULOS: modulos,
      ARQUIVOS_ENVIADOS: uploadedFiles,
      ESTATISTICAS: {
        total_modulos: modulos.length,
        modulos_com_video: uploadedFiles.filter((f) => f.type.includes("video"))
          .length,
        modulos_com_conteudo: uploadedFiles.filter((f) => f.type === "document")
          .length,
        modulos_youtube: uploadedFiles.filter((f) => f.type === "video_youtube")
          .length,
      },
    });
  } catch (error) {
    console.error("Erro ao criar curso assíncrono:", error);
    res.status(500).json({ message: error.message });
  }
};

const createSincrono = async (req, res) => {
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    ID_FORMADOR,
    DATA_INICIO,
    DATA_FIM,
    VAGAS,
    DATA_LIMITE_INSCRICAO,
    HABILIDADES,
    OBJETIVOS,
    ID_TOPICO,
  } = req.body;

  let transaction;

  try {
    transaction = await sequelize.transaction();

    const modulos = JSON.parse(req.body.MODULOS);

    const cursoExistente = await Curso.findOne({
      where: {
        NOME,
        ID_AREA,
      },
      transaction,
    });

    if (cursoExistente) {
      await transaction.rollback();
      return res.status(400).json({ message: "Curso já existe" });
    }

    let imagemUrl = null;
    let imagemPublicId = null;

    const imagem = req.files.find((file) => file.fieldname === "imagem");

    if (imagem) {
      const result = await streamUpload(
        imagem.buffer,
        `cursos/${NOME}`,
        "auto"
      );
      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }

    const curso = await Curso.create(
      {
        NOME,
        DESCRICAO_OBJETIVOS__,
        DIFICULDADE_CURSO__,
        IMAGEM: imagemUrl,
        IMAGEM_PUBLIC_ID: imagemPublicId,
        ID_AREA,
        ID_TOPICO,
        DATA_CRIACAO__: new Date(),
      },
      { transaction }
    );

    const habilidadesArray = HABILIDADES.split(",").map((habilidade) => {
      return { DESCRICAO: habilidade.trim() };
    });

    const objetivosArray = OBJETIVOS.split(",").map((objetivo) => {
      return { DESCRICAO: objetivo.trim() };
    });

    await Promise.all([
      Habilidades.bulkCreate(
        habilidadesArray.map((habilidade) => ({
          ...habilidade,
          ID_CURSO: curso.ID_CURSO,
        })),
        { transaction }
      ),
      Objetivos.bulkCreate(
        objetivosArray.map((objetivo) => ({
          ...objetivo,
          ID_CURSO: curso.ID_CURSO,
        })),
        { transaction }
      ),
    ]);

    const uploadedFiles = [];

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );
      const contentFiles = req.files.filter((file) => {
        return file.fieldname.startsWith(`module_${i}_content_`);
      });

      let videoUrl = null;
      let contentUrls = [];

      const hasVideoFile = videoFile ? true : false;
      const hasVideoURL = modulo.VIDEO_URL ? true : false;
      const hasContentFiles = contentFiles && contentFiles.length > 0;

      if (!hasVideoFile && !hasVideoURL && !hasContentFiles) {
        console.warn(
          `Módulo síncrono "${modulo.NOME}" sem conteúdo. Criando apenas estrutura...`
        );

        await Modulos.create(
          {
            ID_CURSO: curso.ID_CURSO,
            NOME: modulo.NOME,
            DESCRICAO: modulo.DESCRICAO,
            VIDEO_URL: null,
            FILE_URL: JSON.stringify([]),
            TEMPO_ESTIMADO_MIN: modulo.DURACAO,
          },
          { transaction }
        );

        continue;
      }

      if (videoFile) {
        const result = await streamUpload(
          videoFile.buffer,
          `cursos/${NOME}/modulos/videos`,
          "video"
        );
        videoUrl = result.secure_url;

        uploadedFiles.push({
          originalname: videoFile.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          type: "video_upload",
          module: modulo.NOME,
        });

        console.log(
          `Vídeo síncrono uploaded para módulo ${modulo.NOME}: ${result.secure_url}`
        );
      } else if (modulo.VIDEO_URL) {
        videoUrl = modulo.VIDEO_URL;

        uploadedFiles.push({
          url: modulo.VIDEO_URL,
          type: "video_youtube",
          module: modulo.NOME,
        });

        console.log(
          `URL do YouTube síncrono para módulo ${modulo.NOME}: ${modulo.VIDEO_URL}`
        );
      }

      if (contentFiles && contentFiles.length > 0) {
        for (const contentFile of contentFiles) {
          try {
            console.log("Uploading sync file:", contentFile.originalname);

            const result = await saveFileToSupabase(
              contentFile.buffer,
              contentFile.originalname,
              "course-sync"
            );
            contentUrls.push(result.url);

            uploadedFiles.push({
              originalname: contentFile.originalname,
              url: result.url,
              path: result.path,
              type: "document",
              module: modulo.NOME,
            });
          } catch (error) {
            console.error("Error uploading sync file:", error);
          }
        }
      }

      await Modulos.create(
        {
          ID_CURSO: curso.ID_CURSO,
          NOME: modulo.NOME,
          DESCRICAO: modulo.DESCRICAO,
          VIDEO_URL: videoUrl,
          FILE_URL: JSON.stringify(contentUrls),
          TEMPO_ESTIMADO_MIN: modulo.DURACAO,
        },
        { transaction }
      );

      console.log(
        `Módulo síncrono criado: ${modulo.NOME} com conteúdo: ${
          videoUrl || contentUrls.length > 0 ? "SIM" : "Apenas descrição"
        }`
      );
    }

    let formadorId = ID_FORMADOR;
    if (ID_FORMADOR === 0 || ID_FORMADOR === "0") {
      formadorId = null;
    }

    const cursoSincrono = await CursoSincrono.create(
      {
        ID_CURSO: curso.ID_CURSO,
        ID_UTILIZADOR: formadorId,
        VAGAS,
        DATA_INICIO,
        DATA_LIMITE_INSCRICAO_S: DATA_LIMITE_INSCRICAO,
        DATA_FIM,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Curso síncrono criado com sucesso!",
      "Curso: ": curso,
      "Curso Sincrono: ": cursoSincrono,
      HABILIDADES: habilidadesArray,
      OBJETIVOS: objetivosArray,
      MODULOS: modulos,
      ARQUIVOS_ENVIADOS: uploadedFiles,
      ESTATISTICAS: {
        total_modulos: modulos.length,
        modulos_com_video: uploadedFiles.filter((f) => f.type.includes("video"))
          .length,
        modulos_com_conteudo: uploadedFiles.filter((f) => f.type === "document")
          .length,
        modulos_youtube: uploadedFiles.filter((f) => f.type === "video_youtube")
          .length,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Erro ao criar curso síncrono:", error);
    res.status(500).json({ message: error.message });
  }
};

const convertCursoType = async (req, res) => {
  const { id } = req.params;
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    DATA_INICIO,
    DATA_FIM,
    HABILIDADES,
    OBJETIVOS,
    ID_TOPICO,
    ID_UTILIZADOR,
    VAGAS,
    NEW_TYPE,
    OLD_TYPE,
    DATA_LIMITE_INSCRICAO,
  } = req.body;

  let transaction;

  try {
    transaction = await sequelize.transaction();

    const curso = await Curso.findByPk(id, { transaction });
    if (!curso) {
      await transaction.rollback();
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    console.log(`Convertendo curso ${id} de ${OLD_TYPE} para ${NEW_TYPE}`);

    let imagemUrl = curso.IMAGEM;
    let imagemPublicId = curso.IMAGEM_PUBLIC_ID;

    const imagem = req.files?.find((file) => file.fieldname === "imagem");
    if (imagem) {
      const result = await streamUpload(
        imagem.buffer,
        `cursos/${NOME}`,
        "auto"
      );
      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }

    await curso.update(
      {
        NOME,
        DESCRICAO_OBJETIVOS__,
        DIFICULDADE_CURSO__,
        IMAGEM: imagemUrl,
        IMAGEM_PUBLIC_ID: imagemPublicId,
        ID_AREA,
        ID_TOPICO,
      },
      { transaction }
    );

    if (OLD_TYPE === "Síncrono") {
      await CursoSincrono.destroy({ where: { ID_CURSO: id }, transaction });
      console.log("Removido dados de curso síncrono");
    } else if (OLD_TYPE === "Assíncrono") {
      await CursoAssincrono.destroy({ where: { ID_CURSO: id }, transaction });
      console.log("Removido dados de curso assíncrono");
    }

    if (NEW_TYPE === "Síncrono") {
      const numeroSincronos = await CursoSincrono.count({ transaction });
      await CursoSincrono.create(
        {
          ID_CURSO: curso.ID_CURSO,
          ID_UTILIZADOR: ID_UTILIZADOR,
          VAGAS: VAGAS,
          DATA_INICIO: DATA_INICIO,
          DATA_FIM: DATA_FIM,
          DATA_LIMITE_INSCRICAO_S: DATA_LIMITE_INSCRICAO,
        },
        { transaction }
      );
      console.log("✅ Criado como curso síncrono");
    } else if (NEW_TYPE === "Assíncrono") {
      const numeroAssincronos = await CursoAssincrono.count({ transaction });
      await CursoAssincrono.create(
        {
          ID_CURSO: curso.ID_CURSO,
          NUMERO_CURSOS_ASSINCRONOS: numeroAssincronos + 1,
          DATA_INICIO: DATA_INICIO,
          DATA_FIM: DATA_FIM,
        },
        { transaction }
      );
      console.log("✅ Criado como curso assíncrono");
    }

    if (HABILIDADES && OBJETIVOS) {
      const habilidadesArray = HABILIDADES.split(",")
        .map((habilidade) => ({ DESCRICAO: habilidade.trim() }))
        .filter((h) => h.DESCRICAO);

      const objetivosArray = OBJETIVOS.split(",")
        .map((objetivo) => ({ DESCRICAO: objetivo.trim() }))
        .filter((o) => o.DESCRICAO);

      await Promise.all([
        Habilidades.destroy({
          where: { ID_CURSO: curso.ID_CURSO },
          transaction,
        }),
        Objetivos.destroy({ where: { ID_CURSO: curso.ID_CURSO }, transaction }),
      ]);

      await Promise.all([
        Habilidades.bulkCreate(
          habilidadesArray.map((habilidade) => ({
            ...habilidade,
            ID_CURSO: curso.ID_CURSO,
          })),
          { transaction }
        ),
        Objetivos.bulkCreate(
          objetivosArray.map((objetivo) => ({
            ...objetivo,
            ID_CURSO: curso.ID_CURSO,
          })),
          { transaction }
        ),
      ]);
    }

    if (req.body.MODULOS) {
      const modulos = JSON.parse(req.body.MODULOS);

      await Modulos.destroy({
        where: { ID_CURSO: curso.ID_CURSO },
        transaction,
      });

      for (let i = 0; i < modulos.length; i++) {
        const modulo = modulos[i];

        const videoFile = req.files?.find(
          (file) => file.fieldname === `module_${i}_video`
        );
        const contentFiles =
          req.files?.filter((file) =>
            file.fieldname.startsWith(`module_${i}_content_`)
          ) || [];

        let videoUrl = null;
        let contentUrls = [];

        if (videoFile) {
          const result = await streamUpload(
            videoFile.buffer,
            `cursos/${NOME}/modulos/videos`,
            "video"
          );
          videoUrl = result.secure_url;
        } else if (modulo.VIDEO_URL) {
          videoUrl = modulo.VIDEO_URL;
        }

        for (const contentFile of contentFiles) {
          try {
            const result = await saveFileToSupabase(
              contentFile.buffer,
              contentFile.originalname,
              `course-convert-${curso.ID_CURSO}`
            );
            contentUrls.push(result.url);
          } catch (error) {
            console.error("Erro ao upload do arquivo:", error);
          }
        }

        await Modulos.create(
          {
            ID_CURSO: curso.ID_CURSO,
            NOME: modulo.NOME,
            DESCRICAO: modulo.DESCRICAO,
            VIDEO_URL: videoUrl,
            FILE_URL: JSON.stringify(contentUrls),
            TEMPO_ESTIMADO_MIN: modulo.DURACAO,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Curso convertido de ${OLD_TYPE} para ${NEW_TYPE} com sucesso!`,
      oldType: OLD_TYPE,
      newType: NEW_TYPE,
      curso: curso,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Erro ao converter curso:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao converter curso",
      error: error.message,
    });
  }
};

const deleteCurso = async (req, res) => {
  const { id } = req.params;
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const curso = await Curso.findByPk(id, {
      include: [
        { model: Modulos, as: "MODULOS" },
        { model: CursoAssincrono },
        { model: CursoSincrono },
        { model: Objetivos, as: "OBJETIVOS" },
        { model: Habilidades, as: "HABILIDADES" },
        { model: Topico, as: "Topico" },
      ],
      transaction,
    });

    if (!curso) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    if (curso.IMAGEM_PUBLIC_ID) {
      try {
        await cloudinary.uploader.destroy(curso.IMAGEM_PUBLIC_ID);
        console.log(`Deleted course image: ${curso.IMAGEM_PUBLIC_ID}`);
      } catch (err) {
        console.warn(
          `Failed to delete course image: ${curso.IMAGEM_PUBLIC_ID}`,
          err
        );
      }
    }

    if (curso.MODULOS && curso.MODULOS.length > 0) {
      for (const modulo of curso.MODULOS) {
        if (modulo.VIDEO_URL) {
          try {
            const publicId = extractCloudinaryPublicId(modulo.VIDEO_URL);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "video",
              });
              console.log(`Deleted module video: ${publicId}`);
            }
          } catch (err) {
            console.warn(
              `Failed to delete module video: ${modulo.VIDEO_URL}`,
              err
            );
          }
        }

        if (modulo.FILE_URL) {
          try {
            let fileUrls = modulo.FILE_URL;

            if (typeof fileUrls === "string") {
              try {
                fileUrls = JSON.parse(fileUrls);
              } catch (e) {
                fileUrls = [fileUrls];
              }
            }

            if (Array.isArray(fileUrls)) {
              for (const fileUrl of fileUrls) {
                await deleteFile(fileUrl);
              }
            }
          } catch (err) {
            console.warn(
              `Failed to process module files: ${modulo.FILE_URL}`,
              err
            );
          }
        }
      }
    }

    await ProgressoModulo.destroy({
      where: { ID_CURSO: id },
      transaction,
    }).catch((err) => console.warn("Error deleting module progress", err));

    if (curso.CursoSincrono) {
      await InscricaoSincrono.destroy({
        where: { ID_CURSO_SINCRONO: curso.CursoSincrono.ID_CURSO },
        transaction,
      }).catch((err) => console.warn("Error deleting inscriptions", err));

      await FrequenciaSincrono.destroy({
        where: { ID_CURSO_SINCRONO: curso.CursoSincrono.ID_CURSO },
        transaction,
      }).catch((err) => console.warn("Error deleting attendance records", err));
    }

    await Promise.all(
      (curso.MODULOS || []).map(async (modulo) => {
        try {
          await Notas.destroy({
            where: { ID_MODULO: modulo.ID_MODULO },
            transaction,
          });
        } catch (err) {
          console.warn(
            `Error deleting notes for module ${modulo.ID_MODULO}`,
            err
          );
        }
      })
    ).catch((err) => console.warn("Error in notes deletion process", err));

    await Modulos.destroy({
      where: { ID_CURSO: id },
      transaction,
    });

    await Objetivos.destroy({
      where: { ID_CURSO: id },
      transaction,
    });

    await Habilidades.destroy({
      where: { ID_CURSO: id },
      transaction,
    });

    if (curso.CursoAssincrono) {
      await CursoAssincrono.destroy({
        where: { ID_CURSO: id },
        transaction,
      });
    }

    if (curso.CursoSincrono) {
      await CursoSincrono.destroy({
        where: { ID_CURSO: id },
        transaction,
      });
    }

    await curso.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ message: "Curso apagado com sucesso" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Erro ao deletar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const match = url.match(/\/v\d+\/([^/\.]+)/);
  return match ? match[1] : null;
}

async function deleteFile(fileUrl) {
  if (!fileUrl) return;

  if (fileUrl.includes("supabase")) {
    try {
      const url = new URL(fileUrl);
      const pathMatch = url.pathname.match(
        /\/storage\/v1\/object\/public\/course-files\/(.+)$/
      );
      if (pathMatch) {
        const filePath = pathMatch[1];
        await deleteFileFromSupabase(filePath);
      }
    } catch (error) {
      console.warn("Erro ao deletar arquivo do Supabase:", error);
    }
  } else if (fileUrl.includes("localhost") || fileUrl.includes(BACKEND_URL)) {
    const localPath = fileUrl.split(/localhost:\d+|https?:\/\/[^\/]+/)[1];
    if (localPath) {
      const fullPath = path.join(__dirname, "..", "public", localPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted local file: ${fullPath}`);
      }
    }
  } else if (fileUrl.includes("cloudinary")) {
    const publicId = extractCloudinaryPublicId(fileUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      } catch (e) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e2) {
          console.warn(`Failed to delete Cloudinary asset: ${publicId}`);
        }
      }
      console.log(`Deleted Cloudinary file: ${publicId}`);
    }
  }
}

const getInscritos = async (req, res) => {
  const { id } = req.params;

  try {
    const inscritos = await InscricaoSincrono.findAll({
      where: { ID_CURSO_SINCRONO: id },
      include: [
        {
          model: Utilizador,
          as: "UTILIZADOR",
          attributes: ["ID_UTILIZADOR", "NOME", "EMAIL"],
        },
      ],
    });

    res.status(200).json(inscritos);
  } catch (error) {
    console.error("Erro ao obter inscritos:", error);
    res.status(500).json({ message: error.message });
  }
};

const checkCategoriaAssociation = async (req, res) => {
  try {
    const { categoriaId } = req.params;

    const count = await Curso.count({
      include: [
        {
          model: Area,
          where: { ID_CATEGORIA: categoriaId },
          required: true,
        },
      ],
    });

    res.json({
      temCursos: count > 0,
      quantidade: count,
    });
  } catch (error) {
    console.error("Erro ao verificar associação de categoria:", error);
    res.status(500).json({ message: error.message });
  }
};

const checkAreaAssociation = async (req, res) => {
  try {
    const { areaId } = req.params;

    const count = await Curso.count({
      where: { ID_AREA: areaId },
    });

    res.json({
      temCursos: count > 0,
      quantidade: count,
    });
  } catch (error) {
    console.error("Erro ao verificar associação de área:", error);
    res.status(500).json({ message: error.message });
  }
};

const checkTopicoAssociation = async (req, res) => {
  try {
    const { topicoId } = req.params;

    const count = await Curso.count({
      where: { ID_TOPICO: topicoId },
    });

    res.json({
      temCursos: count > 0,
      quantidade: count,
    });
  } catch (error) {
    console.error("Erro ao verificar associação de tópico:", error);
    res.status(500).json({ message: error.message });
  }
};

const searchCursos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      category = "",
      area = "",
      topic = "",
      difficulty = "",
      type = "",
      sortBy = "newest",
      rating = "",
    } = req.query;

    console.log("Parâmetros de pesquisa recebidos:", {
      search,
      category,
      area,
      topic,
      difficulty,
      type,
      sortBy,
      rating,
    });

    const offset = (page - 1) * limit;

    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { NOME: { [Op.iLike]: `%${search}%` } },
        { DESCRICAO_OBJETIVOS__: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (difficulty) {
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push({ DIFICULDADE_CURSO__: difficulty });
    }

    if (area) {
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push({ ID_AREA: area });
    }

    if (topic) {
      whereConditions[Op.and] = whereConditions[Op.and] || [];
      whereConditions[Op.and].push({ ID_TOPICO: topic });
    }

    const includeArray = [
      {
        model: Area,
        as: "AREA",
        attributes: ["NOME", "ID_AREA"],
        include: [
          {
            model: Categoria,
            as: "Categoria",
            attributes: ["ID_CATEGORIA__PK___", "NOME__"],
            ...(category && { where: { ID_CATEGORIA__PK___: category } }),
          },
        ],
        ...(category && { required: true }),
      },
      {
        model: Topico,
        as: "Topico",
        attributes: ["ID_TOPICO", "TITULO"],
      },
      {
        model: CursoAssincrono,
        required: false,
        attributes: [
          "DATA_INICIO",
          "DATA_FIM",
          "ESTADO",
          "NUMERO_CURSOS_ASSINCRONOS",
        ],
      },
      {
        model: CursoSincrono,
        required: false,
        attributes: [
          "DATA_INICIO",
          "DATA_FIM",
          "VAGAS",
          "ESTADO",
          "ID_UTILIZADOR",
        ],
        include: [
          {
            model: Utilizador,
            attributes: ["USERNAME", "NOME"],
          },
        ],
      },
      {
        model: Modulos,
        attributes: ["TEMPO_ESTIMADO_MIN", "NOME"],
        as: "MODULOS",
      },
    ];

    if (type === "sincrono") {
      includeArray[2].required = false;
      includeArray[3].required = true;
    } else if (type === "assincrono") {
      includeArray[2].required = true;
      includeArray[3].required = false;
    }

    let orderClause;
    switch (sortBy) {
      case "oldest":
        orderClause = [["DATA_CRIACAO__", "ASC"]];
        break;
      case "name_asc":
        orderClause = [["NOME", "ASC"]];
        break;
      case "name_desc":
        orderClause = [["NOME", "DESC"]];
        break;
      case "difficulty_asc":
        orderClause = [
          [
            sequelize.literal(`
            CASE 
              WHEN "DIFICULDADE_CURSO__" = 'Iniciante' THEN 1
              WHEN "DIFICULDADE_CURSO__" = 'Intermédio' THEN 2
              WHEN "DIFICULDADE_CURSO__" = 'Difícil' THEN 3
              ELSE 4
            END
          `),
          ],
        ];
        break;
      case "difficulty_desc":
        orderClause = [
          [
            sequelize.literal(`
            CASE 
              WHEN "DIFICULDADE_CURSO__" = 'Difícil' THEN 1
              WHEN "DIFICULDADE_CURSO__" = 'Intermédio' THEN 2
              WHEN "DIFICULDADE_CURSO__" = 'Iniciante' THEN 3
              ELSE 4
            END
          `),
          ],
        ];
        break;
      case "rating_desc":
        orderClause = [
          [
            sequelize.literal(`(
              SELECT AVG("ESTRELAS") 
              FROM "REVIEW" 
              WHERE "REVIEW"."ID_CURSO" = "CURSO"."ID_CURSO"
            )`),
            "DESC",
          ],
        ];
        break;
      default:
        orderClause = [["DATA_CRIACAO__", "DESC"]];
    }

    const { rows: allCourses } = await Curso.findAndCountAll({
      where: whereConditions,
      include: includeArray,
      order: orderClause,
      distinct: true,
      col: "ID_CURSO",
    });

    console.log(`Encontrados ${allCourses.length} cursos no total`);

    const coursesWithReviews = await Promise.all(
      allCourses.map(async (curso) => {
        const cursoData = curso.toJSON();

        try {
          const reviewStats = await sequelize.query(
            `
            SELECT 
              AVG("ESTRELAS") as "averageRating",
              COUNT("ID_REVIEW") as "totalReviews"
            FROM "REVIEW"
            WHERE "ID_CURSO" = :cursoId
          `,
            {
              replacements: { cursoId: curso.ID_CURSO },
              type: sequelize.QueryTypes.SELECT,
            }
          );

          const stats = reviewStats[0] || {};
          cursoData.averageRating = parseFloat(stats.averageRating) || 0;
          cursoData.totalReviews = parseInt(stats.totalReviews) || 0;
        } catch (error) {
          console.warn(
            `Erro ao procurar reviews para curso ${curso.ID_CURSO}:`,
            error
          );
          cursoData.averageRating = 0;
          cursoData.totalReviews = 0;
        }

        return cursoData;
      })
    );

    const coursesAtivos = coursesWithReviews.filter((curso) => {
      if (
        curso.CURSO_ASSINCRONO &&
        (curso.CURSO_ASSINCRONO.ESTADO === "Ativo" ||
          curso.CURSO_ASSINCRONO.ESTADO === "Em curso")
      ) {
        return true;
      }

      if (curso.CURSO_SINCRONO && curso.CURSO_SINCRONO.ESTADO === "Ativo") {
        return true;
      }

      return false;
    });

    console.log(
      `Após filtrar por estado: ${coursesAtivos.length} cursos ativos`
    );

    let coursesFiltered = coursesAtivos;
    if (rating) {
      const minRating = parseFloat(rating);
      coursesFiltered = coursesAtivos.filter((curso) => {
        return curso.averageRating >= minRating;
      });

      console.log(
        `Após filtrar por rating (${minRating}+): ${coursesFiltered.length} cursos`
      );
    }

    if (sortBy === "rating_desc") {
      coursesFiltered.sort((a, b) => {
        return (b.averageRating || 0) - (a.averageRating || 0);
      });
    }

    const totalCount = coursesFiltered.length;
    const paginatedCourses = coursesFiltered.slice(
      offset,
      offset + parseInt(limit)
    );
    const hasMore = offset + paginatedCourses.length < totalCount;

    res.status(200).json({
      courses: paginatedCourses,
      totalCount: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      hasMore: hasMore,
    });
  } catch (error) {
    console.error("Erro na pesquisa de cursos:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCursosByFormador = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const cursos = await Curso.findAll({
      include: [
        {
          model: Area,
          as: "AREA",
          attributes: ["NOME", "ID_AREA"],
          include: [
            {
              model: Categoria,
              as: "Categoria",
              attributes: ["ID_CATEGORIA__PK___", "NOME__"],
            },
          ],
        },
        {
          model: Topico,
          as: "Topico",
          attributes: ["ID_TOPICO", "TITULO", "DESCRICAO"],
        },
        {
          model: CursoSincrono,
          where: { ID_UTILIZADOR: userId },
          required: true,
          attributes: [
            "DATA_INICIO",
            "DATA_FIM",
            "VAGAS",
            "ID_UTILIZADOR",
            "DATA_LIMITE_INSCRICAO_S",
            "ESTADO",
          ],
          include: [
            {
              model: Utilizador,
              attributes: ["ID_UTILIZADOR", "USERNAME", "NOME"],
            },
          ],
        },
        {
          model: Objetivos,
          attributes: ["ID_OBJETIVO", "DESCRICAO"],
          as: "OBJETIVOS",
        },
        {
          model: Habilidades,
          attributes: ["ID_HABILIDADE", "DESCRICAO"],
          as: "HABILIDADES",
        },
        {
          model: Modulos,
          attributes: [
            "ID_MODULO",
            "NOME",
            "DESCRICAO",
            "TEMPO_ESTIMADO_MIN",
            "VIDEO_URL",
            "FILE_URL",
          ],
          as: "MODULOS",
          order: [["ID_MODULO", "ASC"]],
        },
      ],
      order: [["DATA_CRIACAO__", "DESC"]],
    });

    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao procurar cursos do formador:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCursos,
  getCursoById,
  createCurso,
  getCursosPopulares,
  updateCurso,
  createSincrono,
  createAssincrono,
  updateCursoSincrono,
  deleteCurso,
  convertCursoType,
  updateCursoAssincrono,
  getInscritos,
  checkCategoriaAssociation,
  checkAreaAssociation,
  checkTopicoAssociation,
  searchCursos,
  verifyTeacher,
  updateCursoCompleto,
  getCursosByFormador,
};
