const { Resend } = require("resend");
require("dotenv").config();

const TOKEN = process.env.RESEND_API_KEY;

const resend = new Resend(TOKEN);

const sender = 'SoftSkills <softskills-teste@alexandrefernandes.dev>';

module.exports = {
  resend,
  sender,
};
