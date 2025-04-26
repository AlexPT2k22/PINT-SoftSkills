const { Area } = require("../models/index.js");
const sequelize = require("sequelize");

const getAreas = async (req, res) => {
  try {
    const areas = await Area.findAll({
      attributes: ["ID_AREA", "NOME"],
    });
    res.status(200).json(areas);
  } catch (error) {
    console.error("Erro ao buscar as áreas:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAreas,
};
