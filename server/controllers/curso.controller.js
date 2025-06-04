const {
  Curso,
  CursoAssincrono,
  CursoSincrono,
  ConteudoAssincrono,
  ConteudoSincrono,
  Categoria,
  Area,
  InscricaoSincrono,
  FrequenciaSincrono,
  Utilizador,
  Objetivos,
  Habilidades,
  Modulos,
  EstadoOcorrenciaAssincrona,
  EstadoCursoSincrono,
  Topico,
  InscricaoAssincrono,
  InscricaoAssincronoCurso,
  InscricaoSincronoCurso,
  ProgressoModulo,
  Notas,
  UtilizadorTemPerfil,
  Perfil,
} = require("../models/index.js");
const { sequelize } = require("../database/database.js");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const savePdfToServer = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, "../public/uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const uniqueFileName = `${Date.now()}-$${fileName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      // Write file
      fs.writeFileSync(filePath, buffer);

      // Return the URL path that will be used to access the file
      resolve(`/uploads/${uniqueFileName}`);
    } catch (error) {
      reject(error);
    }
  });
};

const streamUpload = (
  buffer,
  folder,
  resource_type = "auto",
  originalFilename = null
) => {
  return new Promise((resolve, reject) => {
    // Extract extension from original filename if provided
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
          streaming_profile: "full_hd", // Cria HLS com múltiplas resoluções
          format: "m3u8", // Garante formato de streaming
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

    // Create stream from buffer
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// para ir buscar todos os cursos
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
        },
        {
          model: CursoSincrono,
          include: [
            {
              model: Utilizador,
              attributes: ["USERNAME", "NOME"],
            },
            {
              model: EstadoCursoSincrono,
              attributes: ["ESTADO"],
            },
          ],
        },
      ],
    });
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao buscar os cursos:", error);
    res.status(500).json({ message: error.message });
  }
};

// para ir buscar um curso específico pelo id
const getCursoById = async (req, res) => {
  const { id } = req.params;

  try {
    // procurar o curso pelo id, incluindo as áreas e categorias com um left join
    const curso = await Curso.findByPk(id, {
      include: [
        {
          model: Area,
          as: "AREA",
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
          model: Topico,
          as: "Topico",
          attributes: ["ID_TOPICO", "TITULO", "DESCRICAO"],
        },
        {
          model: CursoAssincrono,
        },
        {
          model: CursoSincrono,
          include: [
            { model: ConteudoSincrono },
            {
              model: Utilizador,
              attributes: ["USERNAME", "NOME", "LINKEDIN"],
            },
          ],
        },
        {
          model: Objetivos,
          attributes: ["DESCRICAO"],
          as: "OBJETIVOS",
        },
        {
          model: Habilidades,
          attributes: ["DESCRICAO"],
          as: "HABILIDADES",
        },
        {
          model: Modulos,
          attributes: [
            "NOME",
            "DESCRICAO",
            "TEMPO_ESTIMADO_MIN",
            "VIDEO_URL",
            "FILE_URL",
            "ID_MODULO",
          ],
          as: "MODULOS",
        },
      ],
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error(`Erro ao buscar curso com id ${id}:`, error);
    res.status(500).json({ error: "Erro ao buscar curso" });
  }
};

const getCursosPopulares = async (req, res) => {
  try {
    // Get popular courses ordered by number of vacancies (VAGAS)
    const cursos = await Curso.findAll({
      include: [
        {
          model: Area,
          attributes: ["NOME"],
        },
        {
          model: CursoAssincrono,
          required: false, // Use LEFT JOIN
        },
        {
          model: CursoSincrono,
          attributes: ["VAGAS", "DATA_INICIO", "DATA_FIM", "ESTADO"],
          required: false, // Use LEFT JOIN
        },
      ],
      limit: 8,
    });

    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao buscar os cursos populares:", error);
    res.status(500).json({ message: error.message });
  }
};

const verifyTeacher = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.ID_UTILIZADOR;

  try {
    // Verificar se o curso existe
    const curso = await Curso.findByPk(courseId);
    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso não encontrado",
        isTeacher: false,
      });
    }

    // Verificar se é um curso síncrono (só cursos síncronos têm formador)
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
      // Curso assíncrono - não tem formador específico
      return res.status(200).json({
        success: true,
        message: "Curso assíncrono - sem formador específico",
        isTeacher: false,
        courseType: "assincrono",
      });
    }

    // Verificar se o utilizador é o formador do curso síncrono
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

//Criar um curso
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

    // Adicionar habilidades e objetivos ao curso
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

    // Adicionar módulos ao curso
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      // Procurar vídeo e conteúdo pelo nome que definiste no formData
      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );
      const contentFile = req.files.find(
        (file) => file.fieldname === `module_${i}_content`
      );

      let videoUrl = null;
      let contentUrl = null;

      // Upload do vídeo para o Cloudinary
      if (videoFile) {
        const result = await cloudinary.uploader.upload(videoFile.path, {
          resource_type: "video",
          folder: `cursos/${NOME}/modulos/videos`,
        });

        videoUrl = result.secure_url;
      }

      // Upload do conteúdo (pdf/doc/etc.) para o Cloudinary
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
  //FIXME:
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

    // verifica se é exatamente o mesmo curso com os mesmos dados
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
    ID_CATEGORIA,
    DATA_INICIO,
    DATA_FIM,
    VAGAS,
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
    const cursoSincrono = await CursoSincrono.findOne({
      where: {
        ID_CURSO: id,
      },
    });
    if (!cursoSincrono) {
      return res.status(404).json({ error: "Curso Sincrono não encontrado" });
    }

    // Adicionar habilidades e objetivos ao curso
    const habilidadesArray = HABILIDADES.split(",").map((habilidade) => {
      return { DESCRICAO: habilidade.trim() };
    });

    const objetivosArray = OBJETIVOS.split(",").map((objetivo) => {
      return { DESCRICAO: objetivo.trim() };
    });

    // Remover as habilidades existentes do curso
    await Habilidades.destroy({
      where: { ID_CURSO: curso.ID_CURSO },
    });

    // Remover os objetivos existentes do curso
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

    //Destroy dos modulos existentes
    await Modulos.destroy({
      where: { ID_CURSO: curso.ID_CURSO },
    });

    // Adicionar módulos ao curso
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      // Procurar vídeo e conteúdo pelo nome que definiste no formData
      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );
      const contentFile = req.files.find(
        (file) => file.fieldname === `module_${i}_content`
      );

      let videoUrl = null;
      let contentUrl = null;

      // Upload do vídeo para o Cloudinary
      if (videoFile) {
        const result = await streamUpload(
          videoFile.buffer,
          `cursos/${NOME}/modulos/videos`,
          "auto"
        );
        videoUrl = result.secure_url;
      }

      // Upload do conteúdo (pdf/doc/etc.) para o Cloudinary
      if (contentFile) {
        const result = await streamUpload(
          contentFile.buffer,
          `cursos/${NOME}/modulos/conteudos`,
          "auto"
        );
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

    await cursoSincrono.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      ID_AREA,
      ID_UTILIZADOR,
      DATA_INICIO,
      DATA_FIM,
      VAGAS,
    });

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

    // Adicionar habilidades e objetivos ao curso
    const habilidadesArray = HABILIDADES.split(",").map((habilidade) => {
      return { DESCRICAO: habilidade.trim() };
    });

    const objetivosArray = OBJETIVOS.split(",").map((objetivo) => {
      return { DESCRICAO: objetivo.trim() };
    });

    // Remover as habilidades existentes do curso
    await Habilidades.destroy({
      where: { ID_CURSO: curso.ID_CURSO },
    });

    // Remover os objetivos existentes do curso
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

    //Destroy dos modulos existentes
    await Modulos.destroy({
      where: { ID_CURSO: curso.ID_CURSO },
    });

    // Adicionar módulos ao curso
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      // Procurar vídeo e conteúdo pelo nome que definiste no formData
      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );
      const contentFile = req.files.find(
        (file) => file.fieldname === `module_${i}_content`
      );

      let videoUrl = null;
      let contentUrl = null;

      // Upload do vídeo para o Cloudinary
      if (videoFile) {
        const result = await streamUpload(
          videoFile.buffer,
          `cursos/${NOME}/modulos/videos`,
          "auto"
        );

        videoUrl = result.secure_url;
      }

      // Upload do conteúdo (pdf/doc/etc.) para o Cloudinary
      if (contentFile) {
        const result = await streamUpload(
          contentFile.buffer,
          `cursos/${NOME}/modulos/conteudos`,
          "auto"
        );

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

    await cursoAssincrono.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      ID_AREA,
      DATA_INICIO,
      DATA_FIM,
    });
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

    // Adicionar habilidades e objetivos ao curso
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

    // Adicionar módulos ao curso
    const uploadedFiles = []; // Track all uploaded files

    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      // Procurar vídeo pelo nome que definiste no formData
      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );

      // Procurar múltiplos arquivos de conteúdo
      const contentFiles = req.files.filter((file) => {
        return file.fieldname.startsWith(`module_${i}_content_`);
      });

      let videoUrl = null;
      let contentUrls = []; // Array para guardar múltiplas URLs

      // Determinar fonte do vídeo: arquivo upload OU URL do YouTube
      if (videoFile) {
        // CASO 1: Upload de arquivo de vídeo
        const result = await streamUpload(
          videoFile.buffer,
          `cursos/${NOME}/modulos/videos`,
          "video" // Especificar que é vídeo
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
        // CASO 2: URL do YouTube
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

      // Upload dos conteúdos (pdf/doc/etc.) para o servidor local
      if (contentFiles && contentFiles.length > 0) {
        for (const contentFile of contentFiles) {
          try {
            console.log("Uploading file:", contentFile.originalname);

            const filePath = await savePdfToServer(
              contentFile.buffer,
              contentFile.originalname
            );
            const fileUrl = `http://localhost:4000${filePath}`;
            contentUrls.push(fileUrl);

            uploadedFiles.push({
              originalname: contentFile.originalname,
              url: fileUrl,
              type: "document",
              local_path: filePath,
              module: modulo.NOME,
            });
          } catch (error) {
            console.error("Error uploading file:", error);
          }
        }
      }

      // Criar o módulo na base de dados
      await Modulos.create({
        ID_CURSO: curso.ID_CURSO,
        NOME: modulo.NOME,
        DESCRICAO: modulo.DESCRICAO,
        VIDEO_URL: videoUrl, // Pode ser URL do Cloudinary ou URL do YouTube
        FILE_URL: JSON.stringify(contentUrls), // Guardar como JSON string
        TEMPO_ESTIMADO_MIN: modulo.DURACAO,
      });

      console.log(
        `Módulo criado: ${modulo.NOME} com vídeo: ${videoUrl ? "SIM" : "NÃO"}`
      );
    }

    const cursoAssincrono = await CursoAssincrono.create({
      ID_CURSO: curso.ID_CURSO,
      NUMERO_CURSOS_ASSINCRONOS: ADD_COURSE,
      DATA_INICIO,
      DATA_FIM,
    });

    res.status(201).json({
      Curso: curso,
      "Curso Assincrono": cursoAssincrono,
      HABILIDADES: habilidadesArray,
      OBJETIVOS: objetivosArray,
      MODULOS: modulos,
      ARQUIVOS_ENVIADOS: uploadedFiles,
    });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
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
    HABILIDADES,
    OBJETIVOS,
    ID_TOPICO,
  } = req.body;

  let transaction;

  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    const modulos = JSON.parse(req.body.MODULOS);

    // verifica se o curso já existe
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

    // Adicionar habilidades e objetivos ao curso
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

    // Adicionar módulos ao curso
    const uploadedFiles = []; // Track all uploaded files

    // Adicionar módulos ao curso
    for (let i = 0; i < modulos.length; i++) {
      const modulo = modulos[i];

      // Procurar vídeo e conteúdo pelo nome no formData
      const videoFile = req.files.find(
        (file) => file.fieldname === `module_${i}_video`
      );
      const contentFiles = req.files.filter((file) => {
        return file.fieldname.startsWith(`module_${i}_content_`);
      });

      let videoUrl = null;
      let contentUrls = [];

      // Determinar fonte do vídeo: arquivo upload OU URL do YouTube
      if (videoFile) {
        // CASO 1: Upload de arquivo de vídeo
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
        // CASO 2: URL do YouTube
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

      // Upload do conteúdo (pdf/doc/etc.) para o servidor local
      if (contentFiles && contentFiles.length > 0) {
        for (const contentFile of contentFiles) {
          try {
            console.log("Uploading file:", contentFile.originalname);

            const filePath = await savePdfToServer(
              contentFile.buffer,
              contentFile.originalname
            );
            const fileUrl = `http://localhost:4000${filePath}`;
            contentUrls.push(fileUrl);

            uploadedFiles.push({
              originalname: contentFile.originalname,
              url: fileUrl,
              type: "document",
              local_path: filePath,
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
        VIDEO_URL: videoUrl, // Pode ser URL do Cloudinary ou URL do YouTube
        FILE_URL: JSON.stringify(contentUrls),
        TEMPO_ESTIMADO_MIN: modulo.DURACAO,
      });
    }

    if (ID_FORMADOR === 0) {
      ID_FORMADOR = null; // Se não houver formador, definir como null
    }
    const cursoSincrono = await CursoSincrono.create({
      ID_CURSO: curso.ID_CURSO,
      ID_UTILIZADOR: ID_FORMADOR,
      VAGAS,
      DATA_INICIO,
      DATA_FIM,
    });

    res.status(201).json({
      "Curso: ": curso,
      "Curso Sincrono: ": cursoSincrono,
      HABILIDADES: habilidadesArray,
      OBJETIVOS: objetivosArray,
      MODULOS: modulos,
      ARQUIVOS_ENVIADOS: uploadedFiles,
    });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
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
    ID_UTILIZADOR,
    DATA_INICIO,
    DATA_FIM,
    VAGAS,
    ID_TOPICO,
  } = req.body;

  try {
    // Find the course
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // Handle image update if needed (similar to your other update functions)
    let imagemUrl = curso.IMAGEM;
    let imagemPublicId = curso.IMAGEM_PUBLIC_ID;
    if (req.file) {
      const result = await streamUpload(
        req.file.buffer,
        `cursos/${NOME}`,
        "auto"
      );

      imagemUrl = result.secure_url;
      imagemPublicId = result.public_id;
    }

    // Update the base course
    await curso.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      IMAGEM: imagemUrl,
      IMAGEM_PUBLIC_ID: imagemPublicId,
      ID_AREA,
      ID_TOPICO,
    });

    // Check if we already have async or sync version
    const existingAsync = await CursoAssincrono.findOne({
      where: { ID_CURSO: id },
    });
    const existingSync = await CursoSincrono.findOne({
      where: { ID_CURSO: id },
    });

    // Converting to synchronous
    if (!existingSync && ID_UTILIZADOR) {
      // Create synchronous course
      const cursoSincrono = await CursoSincrono.create({
        ID_CURSO: curso.ID_CURSO,
        ID_UTILIZADOR,
        VAGAS,
        DATA_INICIO,
        DATA_FIM,
      });

      // Remove asynchronous if it exists
      if (existingAsync) {
        await existingAsync.destroy();
      }

      return res.status(200).json({
        message: "Curso convertido para síncrono com sucesso",
        curso,
      });
    }

    // Converting to asynchronous
    if (!existingAsync) {
      const NUMERO_CURSOS_ASSINCRONOS = await CursoAssincrono.count();
      const ADD_COURSE = NUMERO_CURSOS_ASSINCRONOS + 1;

      // Create asynchronous course
      const cursoAssincrono = await CursoAssincrono.create({
        ID_CURSO: curso.ID_CURSO,
        NUMERO_CURSOS_ASSINCRONOS: ADD_COURSE,
        DATA_INICIO,
        DATA_FIM,
      });

      // Remove synchronous if it exists
      if (existingSync) {
        await existingSync.destroy();
      }

      return res.status(200).json({
        message: "Curso convertido para assíncrono com sucesso",
        curso,
      });
    }

    res.status(400).json({ error: "Erro na conversão do curso" });
  } catch (error) {
    console.error("Erro ao converter curso:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCurso = async (req, res) => {
  const { id } = req.params;
  let transaction;

  try {
    // Start transaction correctly
    transaction = await sequelize.transaction();

    // Find the course with all its related data
    const curso = await Curso.findByPk(id, {
      include: [
        { model: Modulos, as: "MODULOS" },
        { model: CursoAssincrono },
        { model: CursoSincrono },
        { model: Objetivos, as: "OBJETIVOS" },
        { model: Habilidades, as: "HABILIDADES" },
        { model: Topico, as: "Topico" }, // Add Topico to make sure it's included
      ],
      transaction,
    });

    if (!curso) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // 1. Clean up Cloudinary course image
    if (curso.IMAGEM_PUBLIC_ID) {
      try {
        await cloudinary.uploader.destroy(curso.IMAGEM_PUBLIC_ID);
        console.log(`Deleted course image: ${curso.IMAGEM_PUBLIC_ID}`);
      } catch (err) {
        console.warn(
          `Failed to delete course image: ${curso.IMAGEM_PUBLIC_ID}`,
          err
        );
        // Continue with deletion even if image deletion fails
      }
    }

    // 2. Clean up module files
    if (curso.MODULOS && curso.MODULOS.length > 0) {
      for (const modulo of curso.MODULOS) {
        // Process video deletion
        if (modulo.VIDEO_URL) {
          try {
            // Extract public_id from Cloudinary URL
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

        // Process content files deletion
        if (modulo.FILE_URL) {
          try {
            let fileUrls = modulo.FILE_URL;

            // Handle both string and JSON array formats
            if (typeof fileUrls === "string") {
              try {
                fileUrls = JSON.parse(fileUrls);
              } catch (e) {
                fileUrls = [fileUrls]; // Treat as single URL if not JSON
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

    // 3. Delete associated records in correct order

    // Clear progress records
    await ProgressoModulo.destroy({
      where: { ID_CURSO: id },
      transaction,
    }).catch((err) => console.warn("Error deleting module progress", err));

    // Delete inscriptions for sync courses
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

    // Delete associated notes
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

    // Delete modules
    await Modulos.destroy({
      where: { ID_CURSO: id },
      transaction,
    });

    // Delete objectives and skills
    await Objetivos.destroy({
      where: { ID_CURSO: id },
      transaction,
    });

    await Habilidades.destroy({
      where: { ID_CURSO: id },
      transaction,
    });

    // Delete CursoAssincrono
    if (curso.CursoAssincrono) {
      await CursoAssincrono.destroy({
        where: { ID_CURSO: id },
        transaction,
      });
    }

    // Delete CursoSincrono
    if (curso.CursoSincrono) {
      await CursoSincrono.destroy({
        where: { ID_CURSO: id },
        transaction,
      });
    }

    // Finally delete the main course record
    await curso.destroy({ transaction });

    // Commit transaction
    await transaction.commit();

    res.status(200).json({ message: "Curso apagado com sucesso" });
  } catch (error) {
    // Rollback transaction on error
    if (transaction) await transaction.rollback();
    console.error("Erro ao deletar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to extract Cloudinary public ID
function extractCloudinaryPublicId(url) {
  if (!url) return null;

  // Extract the public ID from Cloudinary URL
  // Format: https://res.cloudinary.com/cloud_name/image_or_video/upload/v123456789/folder/file
  const match = url.match(/\/v\d+\/([^/\.]+)/);
  return match ? match[1] : null;
}

// Helper function to delete files
async function deleteFile(fileUrl) {
  if (!fileUrl) return;

  if (fileUrl.includes("localhost:4000")) {
    // Local file
    const localPath = fileUrl.split("localhost:4000")[1];
    if (!localPath) return;

    const fullPath = path.join(__dirname, "..", "public", localPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted local file: ${fullPath}`);
    }
  } else if (fileUrl.includes("cloudinary")) {
    // Cloudinary file
    const publicId = extractCloudinaryPublicId(fileUrl);
    if (publicId) {
      // Try both raw and image resource types since we don't know the type
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

// Para cursos Sincronos
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
    } = req.query;

    console.log("Parâmetros de pesquisa recebidos:", {
      search,
      category,
      area,
      topic,
      difficulty,
      type,
      sortBy,
    });

    const offset = (page - 1) * limit;

    // Construir condições WHERE
    const whereConditions = {};

    // Pesquisa por nome e descrição
    if (search) {
      whereConditions[Op.or] = [
        { NOME: { [Op.iLike]: `%${search}%` } },
        { DESCRICAO_OBJETIVOS__: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtros específicos
    if (difficulty) {
      whereConditions.DIFICULDADE_CURSO__ = difficulty;
    }

    if (area) {
      whereConditions.ID_AREA = area;
    }

    if (topic) {
      whereConditions.ID_TOPICO = topic;
    }

    console.log("Condições WHERE construídas:", whereConditions);

    // Incluir relacionamentos
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
        attributes: ["DATA_INICIO", "DATA_FIM"],
      },
      {
        model: CursoSincrono,
        required: false,
        attributes: ["DATA_INICIO", "DATA_FIM", "VAGAS"],
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

    // Filtro por tipo de curso
    if (type === "sincrono") {
      includeArray[2].required = false;
      includeArray[3].required = true;
    } else if (type === "assincrono") {
      includeArray[2].required = true;
      includeArray[3].required = false;
    }

    // Definir ordem
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
      default: // newest
        orderClause = [["DATA_CRIACAO__", "DESC"]];
    }

    // Buscar cursos
    const { count, rows: courses } = await Curso.findAndCountAll({
      where: whereConditions,
      include: includeArray,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      col: "ID_CURSO",
    });

    const hasMore = offset + courses.length < count;

    console.log("Cursos encontrados:", courses.length);
    console.log("Total de cursos:", count);

    res.status(200).json({
      courses,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      hasMore,
    });
  } catch (error) {
    console.error("Erro na pesquisa de cursos:", error);
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
};
