const { resend, sender } = require("./mailtrap.config.js");
const {
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_PASSWORD_EMAIL_TEMPLATE,
  PASSWORD_CHANGE_EMAIL_TEMPLATE,
  RESEND_EMAIL_TEMPLATE,
  TEACHER_WELCOME_EMAIL_TEMPLATE,
  COURSE_ENROLLMENT_EMAIL_TEMPLATE,
  COURSE_TEACHER_CHANGE_EMAIL_TEMPLATE,
  COURSE_DATE_CHANGE_EMAIL_TEMPLATE,
  COURSE_LINK_CHANGE_EMAIL_TEMPLATE,
  COURSE_NEW_CONTENT_EMAIL_TEMPLATE,
  COURSE_GENERAL_NOTIFICATION_EMAIL_TEMPLATE,
  COURSE_NEW_ANNOUNCEMENT_EMAIL_TEMPLATE,
} = require("./emailTemplates.js");

const sendVerificationEmail = async (
  username,
  nome,
  email,
  password,
  verificationToken
) => {
  const recipientString = email.toString();
  try {
    console.log(`Sending verification email to ${email}`);
    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: "Verificação de Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{user_name}", username)
        .replace("{nome}", nome)
        .replace("{password}", password)
        .replace("{verification_token}", verificationToken)
        .replace("{email}", email)
        .replace("{auth_url}", "http://localhost:5173/auth?email=" + email),
      category: "Email verification",
    });
    response.statusCode = 200;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const resendEmail = async (username, email, verificationToken) => {
  const recipientString = email.toString();
  try {
    console.log(`Resending verification email to ${email}`);
    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: "Verificação de Email",
      html: RESEND_EMAIL_TEMPLATE.replace("{user_name}", username).replace(
        "{verification_token}",
        verificationToken
      ),
      category: "Email verification",
    });
    response.statusCode = 200;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendResetEmail = async (username, email, resetUrl) => {
  const recipientString = email.toString();

  try {
    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: "Redefinição de password",
      html: RESET_PASSWORD_EMAIL_TEMPLATE.replace(
        "{user_name}",
        username
      ).replace("{reset_url}", resetUrl),
      category: "Password reset",
    });
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendConfirmationEmail = async (username, email, resetPasswordUrl) => {
  const recipientString = email.toString();

  try {
    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: "Alteração de password",
      html: PASSWORD_CHANGE_EMAIL_TEMPLATE.replace(
        "{user_name}",
        username
      ).replace("{reset_url}", resetPasswordUrl),
      category: "Email confirmation",
    });
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const EmailFormadorNovo = async (
  username,
  nome,
  email,
  password,
  verificationToken
) => {
  const recipientString = email.toString();
  try {
    console.log(`a enviar mail para ${email}`);
    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: "Bem-vindo à Equipa de Formadores - SoftSkills",
      html: TEACHER_WELCOME_EMAIL_TEMPLATE.replace(/{user_name}/g, username)
        .replace(/{nome}/g, nome)
        .replace(/{email}/g, email)
        .replace(/{password}/g, password)
        .replace(/{verification_token}/g, verificationToken)
        .replace(/{auth_url}/g, `http://localhost:5173/auth?email=${email}`),
      category: "Registro de Formador",
    });
    response.statusCode = 200;
    console.log("Email enviado com sucesso");
  } catch (error) {
    console.error("Erro:", error);
  }
};

const sendEnrollmentConfirmationEmail = async (
  nome,
  email,
  curso,
  tipoCurso,
  formador = null
) => {
  const recipientString = email.toString();
  try {
    console.log(`Enviando email de confirmação de inscrição para ${email}`);

    // Formatar datas
    const dataInicio = new Date(
      tipoCurso === "sincrono"
        ? curso.CURSO_SINCRONO?.DATA_INICIO
        : curso.CURSO_ASSINCRONO?.DATA_INICIO
    ).toLocaleDateString("pt-PT");

    const dataFim = new Date(
      tipoCurso === "sincrono"
        ? curso.CURSO_SINCRONO?.DATA_FIM
        : curso.CURSO_ASSINCRONO?.DATA_FIM
    ).toLocaleDateString("pt-PT");

    // Informação específica do tipo de curso
    const tipoCursoInfo =
      tipoCurso === "sincrono"
        ? `Formador: <strong>${formador?.NOME || "A confirmar"}</strong><br>`
        : `Tipo: <strong>Curso assíncrono</strong><br>`;

    const cursoUrl = `http://localhost:5173/course/${curso.ID_CURSO}`;

    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: `Inscrição Confirmada: ${curso.NOME}`,
      html: COURSE_ENROLLMENT_EMAIL_TEMPLATE.replace(/{nome}/g, nome)
        .replace(/{curso_nome}/g, curso.NOME)
        .replace(/{tipo_curso_info}/g, tipoCursoInfo)
        .replace(/{data_inicio}/g, dataInicio)
        .replace(/{data_fim}/g, dataFim)
        .replace(/{curso_url}/g, cursoUrl),
      category: "Course Enrollment",
    });

    console.log("Email de confirmação de inscrição enviado com sucesso");
    return response;
  } catch (error) {
    console.error("Erro ao enviar email de confirmação:", error);
  }
};

const sendTeacherChangeNotificationEmail = async (
  nome,
  email,
  curso,
  formadorAnterior,
  novoFormador
) => {
  const recipientString = email.toString();
  try {
    console.log(`Enviando notificação de alteração de formador para ${email}`);

    const formadorAnteriorInfo = formadorAnterior
      ? `Formador Anterior: <strong>${formadorAnterior}</strong><br>`
      : "";

    const cursoUrl = `http://localhost:5173/course/${curso.ID_CURSO}`;

    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: `Alteração de Formador: ${curso.NOME}`,
      html: COURSE_TEACHER_CHANGE_EMAIL_TEMPLATE.replace(/{nome}/g, nome)
        .replace(/{curso_nome}/g, curso.NOME)
        .replace(/{formador_anterior_info}/g, formadorAnteriorInfo)
        .replace(/{novo_formador}/g, novoFormador)
        .replace(/{curso_url}/g, cursoUrl),
      category: "Course Teacher Change",
    });

    console.log("Email de alteração de formador enviado com sucesso");
    return response;
  } catch (error) {
    console.error("Erro ao enviar email de alteração de formador:", error);
  }
};

const sendAnnouncementNotificationEmail = async (
  nome,
  email,
  curso,
  anuncio,
  formadorNome
) => {
  const recipientString = email.toString();
  try {
    console.log(`Enviando notificação de novo anúncio para ${email}`);

    const dataPublicacao = new Date(anuncio.DATA_CRIACAO).toLocaleDateString(
      "pt-PT",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    const cursoUrl = `http://localhost:5173/course/${curso.ID_CURSO}`;
    const anunciosUrl = `http://localhost:5173/course/${curso.ID_CURSO}#anuncios`;

    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: `📢 Novo Anúncio: ${anuncio.TITULO} | ${curso.NOME}`,
      html: COURSE_NEW_ANNOUNCEMENT_EMAIL_TEMPLATE.replace(/{nome}/g, nome)
        .replace(/{curso_nome}/g, curso.NOME)
        .replace(/{anuncio_titulo}/g, anuncio.TITULO)
        .replace(/{anuncio_conteudo}/g, anuncio.CONTEUDO)
        .replace(/{formador_nome}/g, formadorNome)
        .replace(/{data_publicacao}/g, dataPublicacao)
        .replace(/{curso_url}/g, cursoUrl)
        .replace(/{anuncios_url}/g, anunciosUrl),
      category: "Course Announcement",
    });

    console.log("Email de novo anúncio enviado com sucesso");
    return response;
  } catch (error) {
    console.error("Erro ao enviar email de novo anúncio:", error);
  }
};

// Nova função para alteração de datas
const sendDateChangeNotificationEmail = async (
  nome,
  email,
  curso,
  dataAnteriorInicio,
  dataAnteriorFim,
  novaDataInicio,
  novaDataFim,
  formador = null
) => {
  const recipientString = email.toString();
  try {
    console.log(`Enviando notificação de alteração de datas para ${email}`);

    const dataAnteriorInfo =
      dataAnteriorInicio && dataAnteriorFim
        ? `<span style="color: #dc3545;">Data Anterior de Início: <strike>${new Date(dataAnteriorInicio).toLocaleDateString("pt-PT")}</strike></span><br>
         <span style="color: #dc3545;">Data Anterior de Fim: <strike>${new Date(dataAnteriorFim).toLocaleDateString("pt-PT")}</strike></span><br>`
        : "";

    const formadorInfo = formador
      ? `Formador: <strong>${formador}</strong><br>`
      : "";

    const cursoUrl = `http://localhost:5173/course/${curso.ID_CURSO}`;

    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: `Alteração de Datas: ${curso.NOME}`,
      html: COURSE_DATE_CHANGE_EMAIL_TEMPLATE.replace(/{nome}/g, nome)
        .replace(/{curso_nome}/g, curso.NOME)
        .replace(/{data_anterior_info}/g, dataAnteriorInfo)
        .replace(
          /{nova_data_inicio}/g,
          new Date(novaDataInicio).toLocaleDateString("pt-PT")
        )
        .replace(
          /{nova_data_fim}/g,
          new Date(novaDataFim).toLocaleDateString("pt-PT")
        )
        .replace(/{formador_info}/g, formadorInfo)
        .replace(/{curso_url}/g, cursoUrl),
      category: "Course Date Change",
    });

    console.log("Email de alteração de datas enviado com sucesso");
    return response;
  } catch (error) {
    console.error("Erro ao enviar email de alteração de datas:", error);
  }
};

// Nova função para alteração de link de aula
const sendLinkChangeNotificationEmail = async (
  nome,
  email,
  curso,
  aula,
  novoLink
) => {
  const recipientString = email.toString();
  try {
    console.log(`Enviando notificação de alteração de link para ${email}`);

    const dataAula = new Date(aula.DATA_AULA).toLocaleDateString("pt-PT");
    const horarioAula = `${aula.HORA_INICIO} - ${aula.HORA_FIM}`;

    const cursoUrl = `http://localhost:5173/course/${curso.ID_CURSO}`;

    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: `Link Atualizado: ${aula.TITULO}`,
      html: COURSE_LINK_CHANGE_EMAIL_TEMPLATE.replace(/{nome}/g, nome)
        .replace(/{curso_nome}/g, curso.NOME)
        .replace(/{aula_titulo}/g, aula.TITULO)
        .replace(/{data_aula}/g, dataAula)
        .replace(/{horario_aula}/g, horarioAula)
        .replace(/{link_aula}/g, novoLink)
        .replace(/{curso_url}/g, cursoUrl),
      category: "Course Link Change",
    });

    console.log("Email de alteração de link enviado com sucesso");
    return response;
  } catch (error) {
    console.error("Erro ao enviar email de alteração de link:", error);
  }
};

// Nova função para novo conteúdo
const sendNewContentNotificationEmail = async (
  nome,
  email,
  curso,
  conteudoInfo
) => {
  const recipientString = email.toString();
  try {
    console.log(`Enviando notificação de novo conteúdo para ${email}`);

    const dataAdicao = new Date().toLocaleDateString("pt-PT");
    const cursoUrl = `http://localhost:5173/course/${curso.ID_CURSO}`;

    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: `Novo Conteúdo: ${curso.NOME}`,
      html: COURSE_NEW_CONTENT_EMAIL_TEMPLATE.replace(/{nome}/g, nome)
        .replace(/{curso_nome}/g, curso.NOME)
        .replace(/{conteudo_info}/g, conteudoInfo)
        .replace(/{data_adicao}/g, dataAdicao)
        .replace(/{curso_url}/g, cursoUrl),
      category: "Course New Content",
    });

    console.log("Email de novo conteúdo enviado com sucesso");
    return response;
  } catch (error) {
    console.error("Erro ao enviar email de novo conteúdo:", error);
  }
};

// Nova função genérica para notificações
const sendGeneralNotificationEmail = async (
  nome,
  email,
  curso,
  titulo,
  mensagem,
  tipo,
  infoAdicional = ""
) => {
  const recipientString = email.toString();
  try {
    console.log(`Enviando notificação geral para ${email}`);

    const cursoUrl = `http://localhost:5173/course/${curso.ID_CURSO}`;

    const response = await resend.emails.send({
      from: sender,
      to: recipientString,
      subject: `${titulo}: ${curso.NOME}`,
      html: COURSE_GENERAL_NOTIFICATION_EMAIL_TEMPLATE.replace(/{nome}/g, nome)
        .replace(/{curso_nome}/g, curso.NOME)
        .replace(/{notification_title}/g, titulo)
        .replace(/{notification_message}/g, mensagem)
        .replace(/{additional_info}/g, infoAdicional)
        .replace(/{curso_url}/g, cursoUrl),
      category: "Course General Notification",
    });

    console.log("Email de notificação geral enviado com sucesso");
    return response;
  } catch (error) {
    console.error("Erro ao enviar email de notificação geral:", error);
  }
};

// Atualizar module.exports
module.exports = {
  sendVerificationEmail,
  sendResetEmail,
  sendConfirmationEmail,
  resendEmail,
  EmailFormadorNovo,
  sendEnrollmentConfirmationEmail,
  sendTeacherChangeNotificationEmail,
  sendDateChangeNotificationEmail,
  sendLinkChangeNotificationEmail,
  sendNewContentNotificationEmail,
  sendGeneralNotificationEmail,
  sendAnnouncementNotificationEmail,
};
