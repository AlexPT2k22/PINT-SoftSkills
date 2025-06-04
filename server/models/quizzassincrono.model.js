const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const QuizzAssincrono = sequelize.define(
  "QUIZZ_ASSINCRONO",
  {
    ID_QUIZZ_ASSINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_OCORRENCIA: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "OCORRENCIA_ASSINCRONA",
        key: "ID_OCORRENCIA",
      },
    },
    DATA_LIMITE_REALIZACAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DATA_REALIZACAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    NOTA: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    OSERVACAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: DataTypes.BLOB("tiny"),
      allowNull: true,
    },
    ESTADO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    TEMPO_REALIZACAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    NUMERO_TENTATIVAS: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "QUIZZ_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = QuizzAssincrono;
