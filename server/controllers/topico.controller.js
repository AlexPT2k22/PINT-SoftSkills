const {
  Topico,
  Area,
  Curso,
  CursoAssincrono,
  CursoSincrono,
  Utilizador,
  UtilizadorTemPerfil,
} = require("../models");
const { Op } = require("sequelize");

const getAllTopicos = async (req, res) => {
  try {
    const topicos = await Topico.findAll({
      include: [
        {
          model: Area,
          attributes: ["NOME"],
        },
      ],
      order: [["DATA_CRIACAO", "DESC"]],
    });
    res.json(topicos);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: error.message });
  }
};

const getTopicosByArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const topicos = await Topico.findAll({
      where: { ID_AREA: areaId },
      order: [["DATA_CRIACAO", "DESC"]],
    });
    res.json(topicos);
  } catch (error) {
    console.error("Error fetching topics by area:", error);
    res.status(500).json({ message: error.message });
  }
};

const createTopico = async (req, res) => {
  try {
    const user = req.user;
    const { NOME, DESCRICAO, ID_AREA } = req.body;

    console.log("User from token:", user);

    const userPerfil = await UtilizadorTemPerfil.findOne({
      where: {
        ID_UTILIZADOR: user.ID_UTILIZADOR,
        ID_PERFIL: 3,
      },
    });
    if (!userPerfil) {
      return res
        .status(403)
        .json({ message: "Acesso negado. Permissão insuficiente." });
    }
    console.log("User profile:", userPerfil);

    if (!NOME || !ID_AREA) {
      return res
        .status(400)
        .json({ message: "Nome e área associados são obrigatórios" });
    }

    const area = await Area.findByPk(ID_AREA);
    if (!area) {
      return res.status(404).json({ message: "Área não encontrada" });
    }

    const topicoExistente = await Topico.findOne({
      where: { TITULO: NOME, ID_AREA: ID_AREA },
    });
    if (topicoExistente) {
      return res.status(400).json({ message: "Tópico já existe na área" });
    }

    const novoTopico = await Topico.create({
      TITULO: NOME,
      DESCRICAO: DESCRICAO,
      ID_AREA: ID_AREA,
      DATA_CRIACAO: new Date(),
    });

    res.status(201).json(novoTopico);
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateTopico = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.user;
    const { NOME, DESCRICAO } = req.body;

    if (!NOME) {
      return res.status(400).json({ message: "Nome é obrigatório" });
    }
    const topicoExistente = await Topico.findOne({
      where: { TITULO: NOME, ID_TOPICO: { [Op.ne]: id } },
    });
    if (topicoExistente) {
      return res.status(400).json({ message: "Tópico já existe" });
    }

    const topico = await Topico.findByPk(id);
    if (!topico) {
      return res.status(404).json({ message: "Tópico não encontrado" });
    }

    await topico.update({
      TITULO: NOME,
      DESCRICAO: DESCRICAO,
    });

    res.json(topico);
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTopico = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.user;

    const topico = await Topico.findByPk(id);
    if (!topico) {
      return res.status(404).json({ message: "Tópico não encontrado" });
    }

    await topico.destroy();
    res.json({ message: "Tópico excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTopicos,
  getTopicosByArea,
  createTopico,
  updateTopico,
  deleteTopico,
};
