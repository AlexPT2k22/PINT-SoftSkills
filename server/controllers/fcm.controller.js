const { FCMToken, Utilizador } = require("../models/index.js");
const admin = require("../config/firebase.js");
const { Op } = require("sequelize");

// Registrar/atualizar token FCM
const registerFCMToken = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { token, deviceType = 'android', deviceId, appVersion } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token FCM é obrigatório"
      });
    }

    console.log(`Registrando token FCM para usuário ${userId}`);

    // Verificar se o token já existe
    const tokenExistente = await FCMToken.findOne({
      where: { TOKEN: token }
    });

    if (tokenExistente) {
      // Atualizar token existente
      await tokenExistente.update({
        ID_UTILIZADOR: userId,
        DEVICE_TYPE: deviceType,
        DEVICE_ID: deviceId,
        APP_VERSION: appVersion,
        ATIVO: true,
        DATA_ATUALIZACAO: new Date(),
      });

      console.log(`Token FCM atualizado para usuário ${userId}`);
    } else {
      // Criar novo token
      await FCMToken.create({
        ID_UTILIZADOR: userId,
        TOKEN: token,
        DEVICE_TYPE: deviceType,
        DEVICE_ID: deviceId,
        APP_VERSION: appVersion,
        ATIVO: true,
      });

      console.log(`Novo token FCM registrado para usuário ${userId}`);
    }

    res.status(200).json({
      success: true,
      message: "Token FCM registrado com sucesso"
    });

  } catch (error) {
    console.error("Erro ao registrar token FCM:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// Remover token FCM
const unregisterFCMToken = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token FCM é obrigatório"
      });
    }

    await FCMToken.update(
      { ATIVO: false },
      {
        where: {
          ID_UTILIZADOR: userId,
          TOKEN: token
        }
      }
    );

    console.log(`Token FCM desativado para usuário ${userId}`);

    res.status(200).json({
      success: true,
      message: "Token FCM removido com sucesso"
    });

  } catch (error) {
    console.error("Erro ao remover token FCM:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// Enviar notificação push para usuário específico
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    // Buscar tokens ativos do usuário
    const tokens = await FCMToken.findAll({
      where: {
        ID_UTILIZADOR: userId,
        ATIVO: true
      },
      attributes: ['TOKEN', 'DEVICE_TYPE']
    });

    if (tokens.length === 0) {
      console.log(`Nenhum token FCM ativo encontrado para usuário ${userId}`);
      return false;
    }

    console.log(`Enviando notificação push para ${tokens.length} dispositivos do usuário ${userId}`);

    let successCount = 0;
    let failureCount = 0;
    const failedTokens = [];

    for (const tokenObj of tokens) {
      try {
        const message = {
          notification: {
            title: title,
            body: body,
          },
          data: {
            ...data,
            type: data.type || 'notification',
            courseId: data.courseId || '',
            notificationId: data.notificationId || '',
            timestamp: data.timestamp || new Date().toISOString(),
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
          token: tokenObj.TOKEN, // Um token por vez
        };

        const response = await admin.messaging().send(message);
        
        if (response) {
          successCount++;
          console.log(`Notificação enviada para dispositivo ${tokenObj.DEVICE_TYPE}: ${response}`);
        }

      } catch (error) {
        failureCount++;
        failedTokens.push(tokenObj.TOKEN);
        
        console.warn(`Falha ao enviar para token ${tokenObj.TOKEN}:`, {
          errorCode: error.code,
          errorMessage: error.message
        });

        // Verificar se é um erro de token inválido
        if (error.code === 'messaging/registration-token-not-registered' ||
            error.code === 'messaging/invalid-registration-token') {
          console.log(`Marcando token como inválido: ${tokenObj.TOKEN}`);
        }
      }
    }

    console.log(`Resultado do envio:`, {
      userId,
      successCount,
      failureCount,
      totalTokens: tokens.length
    });

    if (failedTokens.length > 0) {
      await FCMToken.update(
        { ATIVO: false },
        {
          where: {
            TOKEN: { [Op.in]: failedTokens }
          }
        }
      );
      console.log(`${failedTokens.length} tokens FCM inválidos desativados`);
    }

    return successCount > 0;

  } catch (error) {
    console.error("Erro ao enviar notificação push:", error);
    return false;
  }
};


const sendPushNotificationToUsers = async (userIds, title, body, data = {}) => {
  try {
    console.log(`Enviando notificação push para ${userIds.length} usuários`);

    let totalSuccess = 0;
    
    // Processar usuários em lotes para evitar sobrecarga
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const promises = batch.map(userId => 
        sendPushNotification(userId, title, body, data)
      );

      const results = await Promise.allSettled(promises);
      
      const batchSuccess = results.filter(r => r.status === 'fulfilled' && r.value).length;
      totalSuccess += batchSuccess;
      
      console.log(`Lote ${Math.floor(i/batchSize) + 1}: ${batchSuccess}/${batch.length} sucessos`);
    }

    console.log(`Total de notificações push enviadas: ${totalSuccess}/${userIds.length}`);

    return totalSuccess;

  } catch (error) {
    console.error("Erro ao enviar notificações push em massa:", error);
    return 0;
  }
};

// Limpar tokens antigos/inativos
const cleanupOldTokens = async (req, res) => {
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

    console.log(`${deletedCount} tokens FCM antigos removidos`);

    res.status(200).json({
      success: true,
      message: `${deletedCount} tokens antigos removidos`,
      deletedCount
    });

  } catch (error) {
    console.error("Erro ao limpar tokens antigos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

module.exports = {
  registerFCMToken,
  unregisterFCMToken,
  sendPushNotification,
  sendPushNotificationToUsers,
  cleanupOldTokens,
};