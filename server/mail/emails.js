const { resend, sender } = require("./mailtrap.config.js");
const {
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_PASSWORD_EMAIL_TEMPLATE,
  PASSWORD_CHANGE_EMAIL_TEMPLATE,
  RESEND_EMAIL_TEMPLATE,
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

module.exports = {
  sendVerificationEmail,
  sendResetEmail,
  sendConfirmationEmail,
  resendEmail,
};
