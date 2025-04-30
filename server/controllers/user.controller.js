const {
  Utilizador,
  UtilizadorTemPerfil,
  Perfil,
  Curso,
  CursoSincrono,
  Area,
  Categoria,
} = require("../models/index.js");
const { Op } = require("sequelize");

const getTeachers = async (req, res) => {
  try {
    const teachers = await Utilizador.findAll({
      attributes: ["ID_UTILIZADOR", "USERNAME", "PRIMEIRO_NOME", "ULTIMO_NOME"],
      include: [
        {
          model: Perfil,
          where: {
            [Op.or]: [
              { ID_PERFIL: 2 },
              { PERFIL: "Formador" },
              { ID_PERFIL: 3 },
              { PERFIL: "Gestor" },
            ],
          }, // filtra os perfis de formador e gestor
          attributes: [], // não traz os dados do perfil, só usa para filtrar
          through: { attributes: [] }, // não traz dados da tabela intermédia
        },
      ],
    });
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Erro ao buscar os professores:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCursosAssociados = async (req, res) => {
  try {
    const id = req.user.ID_UTILIZADOR; // ID do utilizador

    // Look for synchronous courses where this user is the teacher
    const cursos = await Curso.findAll({
      include: [
        {
          model: CursoSincrono,
          where: { ID_UTILIZADOR: id },
          required: true,
          attributes: ["ESTADO", "DATA_INICIO", "DATA_FIM", "VAGAS"],
        },
        {
          model: Area,
          attributes: ["NOME"],
          include: [
            {
              model: Categoria,
              as: "Categoria",
              attributes: ["NOME__"],
            },
          ],
        },
      ],
    });

    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao buscar os cursos associados:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeachers,
  getCursosAssociados,
};
