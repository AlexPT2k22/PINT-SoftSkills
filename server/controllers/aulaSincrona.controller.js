const {
  AulaSincrona,
  PresencaAula,
  Utilizador,
  Modulos,
  InscricaoSincrono,
} = require("../models/index.js");
const { Op } = require("sequelize");

const createAula = async (req, res) => {
  try {
    const {
      ID_CURSO,
      ID_MODULO,
      TITULO,
      DESCRICAO,
      LINK_ZOOM,
      DATA_AULA,
      HORA_INICIO,
      HORA_FIM,
    } = req.body;

    const aula = await AulaSincrona.create({
      ID_CURSO,
      ID_MODULO,
      TITULO,
      DESCRICAO,
      LINK_ZOOM,
      DATA_AULA,
      HORA_INICIO,
      HORA_FIM,
      ESTADO: "Agendada",
    });

    const inscricoes = await InscricaoSincrono.findAll({
      where: {
        ID_CURSO_SINCRONO: ID_CURSO,
      },
      attributes: ["ID_UTILIZADOR"],
    });

    if (inscricoes.length > 0) {
      const presencas = inscricoes.map((inscricao) => ({
        ID_AULA: aula.ID_AULA,
        ID_UTILIZADOR: inscricao.ID_UTILIZADOR,
        PRESENTE: false,
      }));

      await PresencaAula.bulkCreate(presencas);
    }

    res.status(201).json(aula);
  } catch (error) {
    console.error("Erro ao criar aula:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAulasByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const aulas = await AulaSincrona.findAll({
      where: { ID_CURSO: cursoId },
      include: [
        {
          model: Modulos,
          attributes: ["NOME", "DESCRICAO"],
        },
      ],
      order: [
        ["DATA_AULA", "ASC"],
        ["HORA_INICIO", "ASC"],
      ],
    });

    res.status(200).json(aulas);
  } catch (error) {
    console.error("Erro ao procurar aulas:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateAulaStatus = async (req, res) => {
  try {
    const { aulaId } = req.params;
    const { ESTADO, LINK_ZOOM } = req.body;

    const aula = await AulaSincrona.findByPk(aulaId);
    if (!aula) {
      return res.status(404).json({ message: "Aula não encontrada" });
    }

    await aula.update({
      ESTADO,
      LINK_ZOOM: LINK_ZOOM || aula.LINK_ZOOM,
    });

    res.status(200).json(aula);
  } catch (error) {
    console.error("Erro ao atualizar estado da aula:", error);
    res.status(500).json({ message: error.message });
  }
};

const marcarPresenca = async (req, res) => {
  try {
    const { aulaId } = req.params;
    const { alunoId, presente } = req.body;

    let presenca = await PresencaAula.findOne({
      where: {
        ID_AULA: aulaId,
        ID_UTILIZADOR: alunoId,
      },
    });

    if (!presenca) {
      presenca = await PresencaAula.create({
        ID_AULA: aulaId,
        ID_UTILIZADOR: alunoId,
        PRESENTE: presente,
        HORA_ENTRADA: presente ? new Date() : null,
      });
    } else {
      await presenca.update({
        PRESENTE: presente,
        HORA_ENTRADA: presente ? new Date() : null,
      });
    }

    res.status(200).json(presenca);
  } catch (error) {
    console.error("Erro ao marcar presença:", error);
    res.status(500).json({ message: error.message });
  }
};

const getListaPresenca = async (req, res) => {
  try {
    const { aulaId } = req.params;

    const presencas = await PresencaAula.findAll({
      where: { ID_AULA: aulaId },
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME", "EMAIL"],
        },
      ],
    });

    res.status(200).json(presencas);
  } catch (error) {
    console.error("Erro ao procurar lista de presença:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllAulasSincronas = async (req, res) => {
  const userId = req.user.ID_UTILIZADOR;
  try {
    const aulas = await AulaSincrona.findAll({
      include: [
        {
          model: Modulos,
          attributes: ["NOME", "DESCRICAO"],
        },
        {
          model: PresencaAula,
          include: [
            {
              model: Utilizador,
              where: { ID_UTILIZADOR: userId },
              attributes: ["ID_UTILIZADOR", "USERNAME", "EMAIL"],
            },
          ],
        },
      ],
      order: [
        ["DATA_AULA", "ASC"],
        ["HORA_INICIO", "ASC"],
      ],
    });

    res.status(200).json(aulas);
  } catch (error) {
    console.error("Erro ao procurar todas as aulas síncronas:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAula,
  getAulasByCurso,
  updateAulaStatus,
  marcarPresenca,
  getListaPresenca,
  getAllAulasSincronas,
};
