const {
  Utilizador,
  UtilizadorTemPerfil,
  Perfil,
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
            [Op.or]: [{ ID_PERFIL: 2 }, { PERFIL: "Formador" }],
          },
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

module.exports = {
  getTeachers,
};
