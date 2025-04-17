const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Utilizador = sequelize.define(
  "Utilizador",
  {
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    USERNAME: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    PRIMEIRO_NOME: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    ULTIMO_NOME: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    EMAIL: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    PASSWORD: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    CC: {
      type: Sequelize.STRING(8),
      allowNull: true,
    },
    NIF: {
      type: Sequelize.STRING(9),
      allowNull: true,
    },
    MORADA: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    ULTIMO_LOGIN: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    ESTA_VERIFICADO: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    ONLINE: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    RESETPASSWORDTOKEN: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    RESETPASSWORDEXPIRES: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    VERIFICATIONTOKEN: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    VERIFICATIONTOKENEXPIRES: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "UTILIZADOR",
    timestamps: false,
  }
);

module.exports = Utilizador;
