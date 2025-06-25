const { Sequelize } = require("sequelize");
require("dotenv").config();

const PG_URL = process.env.PROD_PG_URL;

const sequelize = new Sequelize(PG_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Para evitar erros de certificado autoassinado
    },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
};

module.exports = { connectDB, sequelize };
