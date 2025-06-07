const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const RespostaQuizAssincrono = sequelize.define(
  "RespostaQuizAssincrono",
  {
    ID_RESPOSTA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_QUIZ: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "QUIZ_ASSINCRONO",
        key: "ID_QUIZ",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    RESPOSTAS: {
      type: DataTypes.JSON, // Armazenar respostas como JSON
      allowNull: false,
    },
    NOTA: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    TEMPO_GASTO_MIN: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DATA_SUBMISSAO: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    TENTATIVA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "RESPOSTA_QUIZ_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = RespostaQuizAssincrono;