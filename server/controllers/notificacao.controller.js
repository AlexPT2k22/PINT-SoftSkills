const {
  Notificacao,
  Utilizador,
  Curso,
  InscricaoSincrono,
  InscricaoAssincrono,
  CursoSincrono,
  CursoAssincrono,
} = require("../models/index.js");
const { Op } = require("sequelize");
const {
  sendTeacherChangeNotificationEmail,
  sendDateChangeNotificationEmail,
  sendLinkChangeNotificationEmail,
  sendNewContentNotificationEmail,
  sendGeneralNotificationEmail,
  sendAnnouncementNotificationEmail,
} = require("../mail/emails.js");

// Criar nova notificação
const createNotification = async (
  userId,
  courseId,
  title,
  message,
  type,
  shouldSendEmail = true,
  emailData = null
) => {
  try {
    const notificacao = await Notificacao.create({
      ID_UTILIZADOR: userId,
      ID_CURSO: courseId,
      TITULO: title,
      MENSAGEM: message,
      TIPO: type,
      DATA_CRIACAO: new Date(),
      LIDA: false,
      EMAIL_ENVIADO: false,
    });

    // Se indicado, enviar email específico baseado no tipo
    if (shouldSendEmail) {
      const user = await Utilizador.findByPk(userId);
      const curso = await Curso.findByPk(courseId, {
        include: [
          { model: CursoSincrono, required: false },
          { model: CursoAssincrono, required: false },
        ],
      });

      if (user && curso) {
        let emailSent = false;

        try {
          switch (type) {
            case "ALTERACAO_FORMADOR":
              if (emailData?.formadorAnterior && emailData?.novoFormador) {
                await sendTeacherChangeNotificationEmail(
                  user.NOME || user.USERNAME,
                  user.EMAIL,
                  curso,
                  emailData.formadorAnterior,
                  emailData.novoFormador
                );
                emailSent = true;
              }
              break;

            case "ALTERACAO_DATA":
              if (emailData?.novaDataInicio && emailData?.novaDataFim) {
                await sendDateChangeNotificationEmail(
                  user.NOME || user.USERNAME,
                  user.EMAIL,
                  curso,
                  emailData.dataAnteriorInicio,
                  emailData.dataAnteriorFim,
                  emailData.novaDataInicio,
                  emailData.novaDataFim,
                  emailData.formador
                );
                emailSent = true;
              }
              break;

            case "ALTERACAO_LINK_AULA":
              if (emailData?.aula && emailData?.novoLink) {
                await sendLinkChangeNotificationEmail(
                  user.NOME || user.USERNAME,
                  user.EMAIL,
                  curso,
                  emailData.aula,
                  emailData.novoLink
                );
                emailSent = true;
              }
              break;

            case "NOVO_CONTEUDO":
              if (emailData?.conteudoInfo) {
                await sendNewContentNotificationEmail(
                  user.NOME || user.USERNAME,
                  user.EMAIL,
                  curso,
                  emailData.conteudoInfo
                );
                emailSent = true;
              }
              break;
            case "NOVO_ANUNCIO":
              if (emailData?.anuncio && emailData?.formadorNome) {
                await sendAnnouncementNotificationEmail(
                  user.NOME || user.USERNAME,
                  user.EMAIL,
                  curso,
                  emailData.anuncio,
                  emailData.formadorNome
                );
                emailSent = true;
              }
              break;

            default:
              // Usar template genérico para outros tipos
              await sendGeneralNotificationEmail(
                user.NOME || user.USERNAME,
                user.EMAIL,
                curso,
                title,
                message,
                type,
                emailData?.infoAdicional || ""
              );
              emailSent = true;
              break;
          }

          // Marcar como enviado se o email foi enviado com sucesso
          if (emailSent) {
            await notificacao.update({ EMAIL_ENVIADO: true });
          }
        } catch (emailError) {
          console.error("Erro ao enviar email de notificação:", emailError);
        }
      }
    }

    return notificacao;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
};

// Notificar todos os inscritos em um curso
const notifyAllEnrolled = async (
  courseId,
  title,
  message,
  type,
  emailData = null
) => {
  try {
    // Verificar tipo de curso
    const curso = await Curso.findByPk(courseId, {
      include: [
        { model: CursoSincrono, required: false },
        { model: CursoAssincrono, required: false },
      ],
    });

    if (!curso) {
      console.error(`Curso ID ${courseId} não encontrado`);
      return false;
    }

    let inscritosIds = [];

    // Buscar IDs de usuários inscritos
    if (curso.CURSO_SINCRONO) {
      const inscricoes = await InscricaoSincrono.findAll({
        where: { ID_CURSO_SINCRONO: curso.CURSO_SINCRONO.ID_CURSO },
        attributes: ["ID_UTILIZADOR"],
      });
      inscritosIds = [
        ...inscritosIds,
        ...inscricoes.map((i) => i.ID_UTILIZADOR),
      ];
    }

    if (curso.CURSO_ASSINCRONO) {
      const inscricoes = await InscricaoAssincrono.findAll({
        where: {
          ID_CURSO_ASSINCRONO: curso.CURSO_ASSINCRONO.ID_CURSO_ASSINCRONO,
        },
        attributes: ["ID_UTILIZADOR"],
      });
      inscritosIds = [
        ...inscritosIds,
        ...inscricoes.map((i) => i.ID_UTILIZADOR),
      ];
    }

    // Remover duplicados
    inscritosIds = [...new Set(inscritosIds)];

    // Criar notificações para cada inscrito com dados de email
    const promises = inscritosIds.map((userId) =>
      createNotification(
        userId,
        courseId,
        title,
        message,
        type,
        true,
        emailData
      )
    );

    await Promise.all(promises);
    console.log(
      `Notificações enviadas para ${inscritosIds.length} inscritos no curso ${courseId}`
    );

    return true;
  } catch (error) {
    console.error("Erro ao notificar inscritos:", error);
    return false;
  }
};

// Buscar notificações de um usuário
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;

    const notificacoes = await Notificacao.findAll({
      where: { ID_UTILIZADOR: userId },
      include: [
        {
          model: Curso,
          attributes: ["ID_CURSO", "NOME"],
        },
      ],
      order: [["DATA_CRIACAO", "DESC"]],
    });

    res.status(200).json(notificacoes);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ message: error.message });
  }
};

// Marcar notificação como lida
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    const notificacao = await Notificacao.findOne({
      where: {
        ID_NOTIFICACAO: notificationId,
        ID_UTILIZADOR: userId,
      },
    });

    if (!notificacao) {
      return res.status(404).json({
        success: false,
        message: "Notificação não encontrada",
      });
    }

    await notificacao.update({ LIDA: true });

    res.status(200).json({
      success: true,
      message: "Notificação marcada como lida",
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  notifyAllEnrolled,
  getUserNotifications,
  markNotificationAsRead,
};
