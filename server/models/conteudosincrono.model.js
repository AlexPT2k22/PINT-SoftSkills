const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const ConteudoSincrono = sequelize.define(
  "CONTEUDO_SINCRONO",
  {
    ID_CONTEUDO__PK___: {
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
    ID_CURSO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    DESCRICAO_TEXT___: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DIFICULDADE_CONTEUDO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    URL: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: Sequelize.BLOB("tiny"), // binary(1) ≈ BLOB pequeno
      allowNull: true,
    },
    DATA_CRIACAO_DATETIME__: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "CONTEUDO_SINCRONO",
    timestamps: false,
  }
);

module.exports = ConteudoSincrono;
