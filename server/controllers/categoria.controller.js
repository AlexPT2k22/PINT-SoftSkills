const { Categoria, Area } = require("../models/index.js");

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
    console.error("Erro ao procurar categorias:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      attributes: ["ID_CATEGORIA__PK___", "NOME__", "DESCRICAO__"],
    });

    res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao procurar categorias:", error);
    res.status(500).json({ message: error.message });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { NOME__, DESCRICAO__ } = req.body;

    if (!NOME__) {
      return res
        .status(400)
        .json({ message: "Nome é obrigatório" });
    }

    const existingCategoria = await Categoria.findOne({
      where: { NOME__: NOME__ },
    });
    if (existingCategoria) {
      return res.status(409).json({ message: "Categoria já existe" });
    }

    const newCategoria = await Categoria.create({
      NOME__,
      DESCRICAO__,
    });

    res.status(201).json(newCategoria);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { NOME__, DESCRICAO__ } = req.body;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    categoria.NOME__ = NOME__;
    categoria.DESCRICAO__ = DESCRICAO__;
    await categoria.save();

    res.status(200).json(categoria);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    await categoria.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategoriasWithAreas,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
