const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Resposta = sequelize.define(
  "RESPOSTA",
  {
    ID_RESPOSTA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_TOPICO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "TOPICO",
        key: "ID_TOPICO",
      },
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    RES_ID_RESPOSTA: {
      type: Sequelize.INTEGER,
      allowNull: true,
      // Caso queiras, podes definir isto como uma foreign key para a própria tabela para respostas a respostas
      references: {
        model: "RESPOSTA",
        key: "ID_RESPOSTA",
      },
    },
    CONTEUDO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    URL: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: Sequelize.BLOB("tiny"),
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "RESPOSTA",
    timestamps: false,
  }
);

module.exports = Resposta;
