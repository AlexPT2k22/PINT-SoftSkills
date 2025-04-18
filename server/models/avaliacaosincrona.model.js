const { Sequelize } = require("sequelize");
const sequelize = require("../database/database.js");

const AvaliacaoSincrona = sequelize.define(
  "AVALIACAO_SINCRONA",
  {
    ID_AVALIACAO_SINCRONA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_AVALIACAO_FINAL_SINCRONA: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "AVALIACAO_FINAL_SINCRONA",
        key: "ID_AVALIACAO_FINAL_SINCRONA",
      },
    },
    ID_CURSO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
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
  },
  {
    tableName: "AVALIACAO_SINCRONA",
    timestamps: false,
  }
);

module.exports = AvaliacaoSincrona;
