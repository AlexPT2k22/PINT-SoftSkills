const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ConteudoAssincrono = sequelize.define(
  "CONTEUDO_ASSINCRONO",
  {
    ID_CONTEUDO_ASSINCRONO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_CURSO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_ASSINCRONO",
        key: "ID_CURSO",
      },
    },
    DESCRICAO__: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DIFICULDADE_CONTEUDO__: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    URL: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    TEMPO_ESTIMADO_CONTEUDO__: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "CONTEUDO_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = ConteudoAssincrono;
