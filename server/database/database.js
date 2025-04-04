const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  `${process.env.PGDATABASE}`,
  `${process.env.PGUSER}`,
  `${process.env.PGPASSWORD}`,
  {
    host: `${process.env.PGHOST}`,
    dialect: "postgres",
    port: process.env.PGPORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Isto evita problemas com certificados self-signed
      },
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
};

module.exports = { connectDB, sequelize };
