const { Area, Categoria } = require("../models/index.js");
const sequelize = require("sequelize");

const getAreas = async (req, res) => {
  try {
    const areas = await Area.findAll({
      attributes: ["ID_AREA", "NOME", "DESCRICAO"],
      include: [
        {
          model: Categoria,
          as: "Categoria",
          attributes: ["ID_CATEGORIA__PK___", "NOME__"],
        },
      ],
    });
    res.status(200).json(areas);
  } catch (error) {
    console.error("Erro ao procurar as áreas:", error);
    res.status(500).json({ message: error.message });
  }
};

const addArea = async (req, res) => {
  try {
    const { NOME, DESCRICAO, ID_CATEGORIA } = req.body;
    const newArea = await Area.create({
      NOME: NOME,
      DESCRICAO: DESCRICAO,
      ID_CATEGORIA__PK___: ID_CATEGORIA,
    });
    res.status(201).json(newArea);
  } catch (error) {
    console.error("Erro ao adicionar a área:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateArea = async (req, res) => {
  try {
    const { ID_AREA } = req.params;
    const { NOME, DESCRICAO, ID_CATEGORIA } = req.body;

    const area = await Area.findByPk(ID_AREA);
    if (!area) {
      return res.status(404).json({ message: "Área não encontrada" });
    }

    area.NOME = NOME;
    area.DESCRICAO = DESCRICAO;
    area.ID_CATEGORIA__PK___ = ID_CATEGORIA;

    await area.save();
    res.status(200).json(area);
  } catch (error) {
    console.error("Erro ao atualizar a área:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteArea = async (req, res) => {
  try {
    const { ID_AREA } = req.params;

    const area = await Area.findByPk(ID_AREA);
    if (!area) {
      return res.status(404).json({ message: "Área não encontrada" });
    }

    await area.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar a área:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAreas,
  addArea,
  updateArea,
  deleteArea,
};
