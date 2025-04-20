const { Categoria, Area } = require("../models/index.js");

// Get all categories with their areas
const getCategoriasWithAreas = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      include: [
        {
          model: Area,
          attributes: ["ID_AREA", "NOME", "DESCRICAO"],
        },
      ],
      attributes: ["ID_CATEGORIA__PK___", "NOME__", "DESCRICAO__"],
    });

    res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategoriasWithAreas };
