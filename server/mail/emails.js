const { mailtrapClient, sender } = require("./mailtrap.config.js");
const VERIFICATION_EMAIL_TEMPLATE = require("./emailTemplates.js");

const sendVerificationEmail = async (username, email, verificationToken) => {
  const recipent = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipent,
      subject: "Verificação de Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{user_name}",
        username
      ).replace("{verification_token}", verificationToken),
      category: "Email verification",
    });
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendVerificationEmail;
