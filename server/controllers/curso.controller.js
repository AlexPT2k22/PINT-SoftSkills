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
} = require("../models/index.js");
const sequelize = require("sequelize");
const cloudinary = require("cloudinary").v2;

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
              attributes: ["USERNAME"],
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
          model: CursoAssincrono,
          include: [{ model: ConteudoAssincrono }],
        },
        {
          model: CursoSincrono,
          include: [
            { model: ConteudoSincrono },
            {
              model: Utilizador,
              attributes: ["USERNAME"],
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
          attributes: ["NOME", "DESCRICAO", "TEMPO_ESTIMADO_MIN"],
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
          attributes: ["VAGAS", "DATA_INICIO", "DATA_FIM"],
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

//Criar um curso
const createCurso = async (req, res) => {
  const {
    NOME,
    DESCRICAO_OBJETIVOS__,
    DIFICULDADE_CURSO__,
    ID_AREA,
    HABILIDADES,
    OBJETIVOS,
  } = req.body;
  try {
    let imagemUrl = null;
    let imagemPublicId = null;

    if (req.file) {
      const bufferToStream = (buffer) => {
        const { Readable } = require("stream");
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        return readable;
      };

      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cursos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          bufferToStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
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

    res.status(201).json(curso, {
      message: "Curso criado com sucesso",
      CursoCompleto: curso,
      HABILIDADES: habilidadesArray,
      OBJETIVOS: objetivosArray,
    });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCurso = async (req, res) => {
  const { id } = req.params;
  const { NOME, DESCRICAO_OBJETIVOS__, DIFICULDADE_CURSO__, ID_AREA } =
    req.body;

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
  } = req.body;
  try {
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    let imagemUrl = curso.IMAGEM;
    let imagemPublicId = curso.IMAGEM_PUBLIC_ID;
    if (req.file) {
      const bufferToStream = (buffer) => {
        const { Readable } = require("stream");
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        return readable;
      };

      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cursos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          bufferToStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
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

    await cursoSincrono.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      ID_AREA,
      ID_UTILIZADOR,
      DATA_INICIO,
      DATA_FIM,
      VAGAS,
      ID_ESTADO_OCORRENCIA_ASSINCRONA2: 1, // ID do estado "Inativo"
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
  } = req.body;
  try {
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }
    let imagemUrl = curso.IMAGEM;
    let imagemPublicId = curso.IMAGEM_PUBLIC_ID;
    if (req.file) {
      const bufferToStream = (buffer) => {
        const { Readable } = require("stream");
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        return readable;
      };

      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cursos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          bufferToStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
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
    await cursoAssincrono.update({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      ID_AREA,
      DATA_INICIO,
      DATA_FIM,
      ID_ESTADO_OCORRENCIA_ASSINCRONA2: 1, // ID do estado "Inativo"
    });
    res.status(200).json({
      "Curso: ": curso,
      "Curso Assincrono: ": cursoAssincrono,
    });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
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
  } = req.body;

  const ID_ESTADO_OCORRENCIA_ASSINCRONA2 = 1; // ID do estado "Inativo"

  // verifica se o curso já existe
  const cursoExistente = await Curso.findOne({
    where: {
      NOME,
      ID_AREA,
    },
  });
  if (cursoExistente) {
    return res.status(400).json({ message: "Curso já existe" });
  }

  try {
    let imagemUrl = null;
    let imagemPublicId = null;

    if (req.file) {
      const bufferToStream = (buffer) => {
        const { Readable } = require("stream");
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        return readable;
      };

      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cursos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          bufferToStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
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

    const cursoSincrono = await CursoSincrono.create({
      ID_CURSO: curso.ID_CURSO,
      ID_UTILIZADOR: ID_FORMADOR,
      VAGAS,
      ID_ESTADO_OCORRENCIA_ASSINCRONA2,
      DATA_INICIO,
      DATA_FIM,
    });

    res.status(201).json({
      "Curso: ": curso,
      "Curso Sincrono: ": cursoSincrono,
    });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
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
  } = req.body;
  try {
    let imagemUrl = null;
    let imagemPublicId = null;

    if (req.file) {
      const bufferToStream = (buffer) => {
        const { Readable } = require("stream");
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        return readable;
      };

      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cursos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          bufferToStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
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

    const cursoAssincrono = await CursoAssincrono.create({
      ID_CURSO: curso.ID_CURSO,
      NUMERO_CURSOS_ASSINCRONOS: ADD_COURSE,
      DATA_INICIO,
      DATA_FIM,
      //ID_ESTADO_OCORRENCIA_ASSINCRONA2: 1, // ID do estado "Inativo" //FIXME: fazer a associação com a tabela de estados
    });

    res.status(201).json({
      "Curso: ": curso,
      "Curso Assincrono: ": cursoAssincrono,
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
    ID_UTILIZADOR, // Teacher for synchronous
    DATA_INICIO,
    DATA_FIM,
    VAGAS,
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
      const bufferToStream = (buffer) => {
        const { Readable } = require("stream");
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        return readable;
      };

      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cursos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          bufferToStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
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
        ID_ESTADO_OCORRENCIA_ASSINCRONA2: 1, // Inactive state
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
  try {
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // Delete the course from Cloudinary
    if (curso.IMAGEM_PUBLIC_ID) {
      await cloudinary.uploader.destroy(curso.IMAGEM_PUBLIC_ID);
    }

    await curso.destroy();
    res.status(200).json({ message: "Curso apagado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar curso:", error);
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
};
