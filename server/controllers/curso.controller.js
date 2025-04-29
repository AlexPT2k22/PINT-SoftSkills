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
        },
        {
          model: CursoAssincrono,
          attributes: ["VAGAS"],
        },
        {
          model: CursoSincrono,
          attributes: ["VAGAS"],
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
          attributes: ["VAGAS"],
          required: false, // Use LEFT JOIN
        },
        {
          model: CursoSincrono,
          attributes: ["VAGAS"],
          required: false, // Use LEFT JOIN
        },
      ],
      order: [
        [
          sequelize.literal(
            'COALESCE("CURSO_ASSINCRONO"."VAGAS", "CURSO_SINCRONO"."VAGAS", 0)'
          ),
          "ASC",
        ],
      ],
      limit: 8, // Changed from 4 to 8 to get more popular courses
    });

    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao buscar os cursos populares:", error);
    res.status(500).json({ message: error.message });
  }
};

//Criar um curso
const createCurso = async (req, res) => {
  const { NOME, DESCRICAO_OBJETIVOS__, DIFICULDADE_CURSO__, ID_AREA } =
    req.body;
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

    res.status(201).json(curso);
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
    ID_FORMADOR,
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
      ID_FORMADOR,
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
  const { NOME, DESCRICAO_OBJETIVOS__, DIFICULDADE_CURSO__, ID_AREA, VAGAS } =
    req.body;
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

    const cursoAssincrono = await CursoAssincrono.create({
      ID_CURSO: curso.ID_CURSO,
      NUMERO_CURSOS_ASSINCRONOS: ADD_COURSE,
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

module.exports = {
  getCursos,
  getCursoById,
  createCurso,
  getCursosPopulares,
  updateCurso,
  createSincrono,
  createAssincrono,
  updateCursoSincrono,
};
