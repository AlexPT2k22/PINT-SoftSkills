const { MailtrapClient } = require("mailtrap");
require("dotenv").config();

const TOKEN = process.env.MAILTRAP_API_KEY;

const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Softskills",
};

module.exports = {
  mailtrapClient,
  sender,
};
