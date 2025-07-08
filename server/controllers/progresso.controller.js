const { ProgressoModulo, Modulos } = require("../models/index.js");

const getCursoProgresso = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { courseId } = req.params;

    const totalModulos = await Modulos.count({
      where: { ID_CURSO: courseId },
    });

    const modulosCompletos = await ProgressoModulo.count({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        COMPLETO: true,
      },
    });

    const percentualProgresso =
      totalModulos > 0
        ? Math.round((modulosCompletos / totalModulos) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      percentualProgresso,
      modulosCompletos,
      totalModulos,
    });
  } catch (error) {
    console.error("Erro ao procurar progresso do curso:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getModulosProgresso = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { courseId } = req.params;

    const modulos = await Modulos.findAll({
      where: { ID_CURSO: courseId },
      attributes: ["ID_MODULO", "NOME"],
      order: [["ID_MODULO", "ASC"]],
    });

    if (!modulos.length) {
      return res.status(404).json({
        success: false,
        message: "Nenhum módulo encontrado para este curso",
      });
    }

    const progressos = await ProgressoModulo.findAll({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        COMPLETO: true,
      },
      attributes: ["ID_MODULO", "DATA_COMPLETO"],
    });

    const modulosCompletosMap = {};
    progressos.forEach((progresso) => {
      modulosCompletosMap[progresso.ID_MODULO] = {
        completo: true,
        dataCompleto: progresso.DATA_COMPLETO,
      };
    });

    const resultado = modulos.map((modulo) => ({
      id: modulo.ID_MODULO,
      nome: modulo.NOME,
      completo: !!modulosCompletosMap[modulo.ID_MODULO],
      dataCompleto: modulosCompletosMap[modulo.ID_MODULO]?.dataCompleto || null,
    }));

    const totalModulos = modulos.length;
    const modulosCompletos = progressos.length;
    const percentualProgresso = Math.round(
      (modulosCompletos / totalModulos) * 100
    );

    return res.status(200).json({
      success: true,
      modulos: resultado,
      percentualProgresso,
      modulosCompletos,
      totalModulos,
    });
  } catch (error) {
    console.error("Erro ao procurar progresso dos módulos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCursoProgresso,
  getModulosProgresso,
};
