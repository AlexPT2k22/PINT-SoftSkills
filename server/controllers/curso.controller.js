const {
  Curso,
  CursoAssincrono,
  CursoSincrono,
  ConteudoAssincrono,
  ConteudoSincrono,
  Categoria,
  Area,
  InscricaoSincrono,
} = require("../models/index.js");

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
        },
        {
          model: CursoSincrono,
          include: [
            { model: InscricaoSincrono, attributes: ["LIMITE_VAGAS_INT__"] },
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
            { model: Categoria, as: "Categoria", attributes: ["NOME__"] },
          ],
        },
        {
          model: CursoAssincrono,
          include: [{ model: ConteudoAssincrono }],
        },
        {
          model: CursoSincrono,
          include: [{ model: ConteudoSincrono }],
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

//Criar um curso
const createCurso = async (req, res) => {
  const { NOME, DESCRICAO_OBJETIVOS__, DIFICULDADE_CURSO__, ID_AREA } =
    req.body;
  try {
    const curso = await Curso.create({
      NOME,
      DESCRICAO_OBJETIVOS__,
      DIFICULDADE_CURSO__,
      IMAGEM: null, // Placeholder for image
      ID_AREA,
      DATA_CRIACAO__: new Date(),
    });
    res.status(201).json(curso);
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCursos, getCursoById, createCurso };
