const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const QuizAssincrono = sequelize.define(
  "QuizAssincrono",
  {
    ID_QUIZ: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    TITULO: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    PERGUNTAS: {
      type: DataTypes.JSON, // Armazenar perguntas como JSON
      allowNull: false,
    },
    TEMPO_LIMITE_MIN: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
    },
    NOTA_MINIMA: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 9.5,
    },
    ATIVO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    CRIADO_POR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
  },
  {
    tableName: "QUIZ_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = QuizAssincrono;