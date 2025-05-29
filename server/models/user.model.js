const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Utilizador = sequelize.define(
  "UTILIZADOR",
  {
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: true,
      autoIncrement: true,
    },
    USERNAME: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    LINKEDIN: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    NOME: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    EMAIL: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    PASSWORD: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    CC: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    NIF: {
      type: DataTypes.STRING(9),
      allowNull: true,
    },
    MORADA: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ULTIMO_LOGIN: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ESTA_VERIFICADO: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    ONLINE: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    RESETPASSWORDTOKEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    RESETPASSWORDEXPIRES: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    VERIFICATIONTOKEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    VERIFICATIONTOKENEXPIRES: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    PRIMEIRO_LOGIN: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "UTILIZADOR",
    timestamps: false,
  }
);

module.exports = Utilizador;
