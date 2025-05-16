const { ProgressoModulo, Modulos } = require("../models/index.js");

const updateProgressoModulo = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { courseId, moduleId } = req.params;

    // Find or create progress record - fixing field name mismatch
    const [progress, created] = await ProgressoModulo.findOrCreate({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        ID_MODULO: moduleId,
      },
      defaults: {
        COMPLETO: true, // Changed from COMPLETED to COMPLETO
        DATA_COMPLETO: new Date(), // Changed from COMPLETION_DATE to DATA_COMPLETO
      },
    });

    // If record exists but not completed, mark it completed
    if (!created && !progress.COMPLETO) {
      // Changed from COMPLETED to COMPLETO
      await progress.update({
        COMPLETO: true, // Changed from COMPLETED to COMPLETO
        DATA_COMPLETO: new Date(), // Changed from COMPLETION_DATE to DATA_COMPLETO
      });
    }

    // Calculate course progress
    const totalModules = await Modulos.count({
      where: { ID_CURSO: courseId },
    });

    const completedModules = await ProgressoModulo.count({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        COMPLETO: true, // Changed from COMPLETED to COMPLETO
      },
    });

    const progressPercentage = Math.round(
      (completedModules / totalModules) * 100
    );

    return res.status(200).json({
      success: true,
      progress: progressPercentage,
      completedModules,
      totalModules,
    });
  } catch (error) {
    console.error("Error marking module as completed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCursoProgresso = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { courseId } = req.params;

    // Calcular progresso do curso
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

    // Calcular percentual de progresso
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
    console.error("Erro ao buscar progresso do curso:", error);
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

    // Buscar todos os módulos do curso
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

    // Buscar registros de progresso para este usuário e curso
    const progressos = await ProgressoModulo.findAll({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: courseId,
        COMPLETO: true,
      },
      attributes: ["ID_MODULO", "DATA_COMPLETO"],
    });

    // Criar mapa de IDs de módulos completos
    const modulosCompletosMap = {};
    progressos.forEach((progresso) => {
      modulosCompletosMap[progresso.ID_MODULO] = {
        completo: true,
        dataCompleto: progresso.DATA_COMPLETO,
      };
    });

    // Preparar resultado com status de cada módulo
    const resultado = modulos.map((modulo) => ({
      id: modulo.ID_MODULO,
      nome: modulo.NOME,
      completo: !!modulosCompletosMap[modulo.ID_MODULO],
      dataCompleto: modulosCompletosMap[modulo.ID_MODULO]?.dataCompleto || null,
    }));

    // Calcular estatísticas gerais
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
    console.error("Erro ao buscar progresso dos módulos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  updateProgressoModulo,
  getCursoProgresso,
  getModulosProgresso,
};
