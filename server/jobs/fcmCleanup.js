const { FCMToken } = require("../models/index.js");
const { Op } = require("sequelize");

const cleanupInactiveTokens = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedCount = await FCMToken.destroy({
      where: {
        ATIVO: false,
        DATA_ATUALIZACAO: {
          [Op.lt]: thirtyDaysAgo
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`FCM Cleanup: ${deletedCount} tokens inativos removidos`);
    }

    return deletedCount;
  } catch (error) {
    console.error(" Erro no cleanup de tokens FCM:", error);
    return 0;
  }
};

module.exports = { cleanupInactiveTokens };