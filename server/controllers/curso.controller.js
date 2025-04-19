const {
  Curso,
  CursoAssincrono,
  CursoSincrono,
  ConteudoAssincrono,
  ConteudoSincrono,
  Categoria,
  Area,
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

  try { // procurar o curso pelo id, incluindo as áreas e categorias com um left join
    const curso = await Curso.findByPk(id, {
      include: [
      { 
        model: Area, 
        attributes: ["NOME"],
        include: [
        { model: Categoria, attributes: ["NOME"] }
        ]
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

module.exports = { getCursos, getCursoById };
