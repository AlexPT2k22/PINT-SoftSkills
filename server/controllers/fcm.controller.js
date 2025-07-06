const { FCMToken, Utilizador } = require("../models/index.js");
const admin = require("../config/firebase.js");

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

    const tokenStrings = tokens.map(t => t.TOKEN);

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        sound: 'default',
      },
      tokens: tokenStrings,
    };

    // Enviar notificação
    const response = await admin.messaging().sendMulticast(message);

    console.log(`Notificação push enviada:`, {
      userId,
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokenStrings.length
    });

    // Processar tokens inválidos
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokenStrings[idx]);
          console.warn(`Token FCM inválido: ${tokenStrings[idx]}`, resp.error);
        }
      });

      // Desativar tokens inválidos
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
    }

    return response.successCount > 0;

  } catch (error) {
    console.error("Erro ao enviar notificação push:", error);
    return false;
  }
};

// Enviar notificação push para múltiplos usuários
const sendPushNotificationToUsers = async (userIds, title, body, data = {}) => {
  try {
    console.log(`Enviando notificação push para ${userIds.length} usuários`);

    const promises = userIds.map(userId => 
      sendPushNotification(userId, title, body, data)
    );

    const results = await Promise.allSettled(promises);
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`Notificações push enviadas: ${successCount}/${userIds.length}`);

    return successCount;

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