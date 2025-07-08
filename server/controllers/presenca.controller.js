const { PresencaAula } = require("../models/index.js");

const registrarPresencasEmMassa = async (req, res) => {
  try {
    const { aulaId } = req.params;
    const { presencas } = req.body;

    const resultados = [];
    for (const item of presencas) {
      const { ID_UTILIZADOR, PRESENTE } = item;

      let presenca = await PresencaAula.findOne({
        where: {
          ID_AULA: aulaId,
          ID_UTILIZADOR: ID_UTILIZADOR,
        },
      });

      if (presenca) {
        await presenca.update({ PRESENTE });
        resultados.push(presenca);
      } else {
        const novaPresenca = await PresencaAula.create({
          ID_AULA: aulaId,
          ID_UTILIZADOR: ID_UTILIZADOR,
          PRESENTE,
          HORA_ENTRADA: PRESENTE ? new Date() : null,
        });
        resultados.push(novaPresenca);
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Presenças atualizadas com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar presenças em massa:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registrarPresencasEmMassa };
