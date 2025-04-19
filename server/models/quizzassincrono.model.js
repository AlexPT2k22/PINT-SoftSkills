const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const QuizzAssincrono = sequelize.define(
  "QUIZZ_ASSINCRONO",
  {
    ID_QUIZZ_ASSINCRONO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    UTI_ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    UTI_ID_UTILIZADOR2: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_OCORRENCIA: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "OCORRENCIA_ASSINCRONA",
        key: "ID_OCORRENCIA",
      },
    },
    DATA_LIMITE_REALIZACAO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    DATA_REALIZACAO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    NOTA: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    OSERVACAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    URL: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: Sequelize.BLOB("tiny"),
      allowNull: true,
    },
    ESTADO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    TEMPO_REALIZACAO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    NUMERO_TENTATIVAS: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "QUIZZ_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = QuizzAssincrono;
