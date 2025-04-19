const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ConteudoAssincrono = sequelize.define(
  "CONTEUDO_ASSINCRONO",
  {
    ID_CONTEUDO_ASSINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_ASSINCRONO",
        key: "ID_CURSO",
      },
    },
    DESCRICAO__: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DIFICULDADE_CONTEUDO__: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    TEMPO_ESTIMADO_CONTEUDO__: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "CONTEUDO_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = ConteudoAssincrono;
