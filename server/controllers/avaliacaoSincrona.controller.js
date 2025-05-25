const { AvaliacaoSincrona, CursoSincrono, Utilizador } = require("../models");

const createAvaliacao = async (req, res) => {
  try {
    const { ID_CURSO, NOTA, OBSERVACAO, DATA_LIMITE_REALIZACAO } = req.body;
    
    const avaliacao = await AvaliacaoSincrona.create({
      ID_CURSO,
      NOTA,
      OBSERVACAO,
      DATA_LIMITE_REALIZACAO,
      DATA_REALIZACAO: new Date(),
      ESTADO: "Pendente",
    });

    res.status(201).json(avaliacao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvaliacoesByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    
    const avaliacoes = await AvaliacaoSincrona.findAll({
      where: { ID_CURSO: cursoId },
      include: [
        {
          model: CursoSincrono,
          attributes: ["ESTADO", "DATA_INICIO", "DATA_FIM"]
        }
      ]
    });

    res.status(200).json(avaliacoes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { NOTA, OBSERVACAO, ESTADO } = req.body;

    const avaliacao = await AvaliacaoSincrona.findByPk(id);
    if (!avaliacao) {
      return res.status(404).json({ message: "Avaliação não encontrada" });
    }

    await avaliacao.update({
      NOTA,
      OBSERVACAO,
      ESTADO
    });

    res.status(200).json(avaliacao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAvaliacao,
  getAvaliacoesByCurso,
  updateAvaliacao
};