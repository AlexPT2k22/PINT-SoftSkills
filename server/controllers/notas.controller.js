const { Notas } = require("../models/index.js");

const getNotasPorModulo = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    const notas = await Notas.findAll({
      where: {
        ID_UTILIZADOR: userId,
        ID_MODULO: moduleId,
      },
      order: [["TEMPO_VIDEO", "ASC"]],
    });

    res.status(200).json(notas);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: error.message });
  }
};

const criarNota = async (req, res) => {
  try {
    const { moduleId, content, timeInSeconds } = req.body;
    const userId = req.user.ID_UTILIZADOR;

    const novaNota = await Notas.create({
      ID_UTILIZADOR: userId,
      ID_MODULO: moduleId,
      TEMPO_VIDEO: timeInSeconds,
      CONTEUDO: content,
    });

    res.status(201).json(novaNota);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: error.message });
  }
};

const atualizarNota = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const userId = req.user.ID_UTILIZADOR;

    const nota = await Notas.findOne({
      where: {
        ID_NOTA: noteId,
        ID_UTILIZADOR: userId,
      },
    });

    if (!nota) {
      return res.status(404).json({ message: "Note not found" });
    }

    nota.CONTEUDO = content;
    nota.DATA_ATUALIZACAO = new Date();
    await nota.save();

    res.status(200).json(nota);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: error.message });
  }
};

const apagarNota = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    const result = await Notas.destroy({
      where: {
        ID_NOTA: noteId,
        ID_UTILIZADOR: userId,
      },
    });

    if (result === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotasPorModulo,
  criarNota,
  atualizarNota,
  apagarNota,
};
