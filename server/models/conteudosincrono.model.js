const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ConteudoSincrono = sequelize.define(
  "CONTEUDO_SINCRONO",
  {
    ID_CONTEUDO__PK___: {
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
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    DESCRICAO_TEXT___: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DIFICULDADE_CONTEUDO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: DataTypes.BLOB("tiny"), // binary(1) ≈ BLOB pequeno
      allowNull: true,
    },
    DATA_CRIACAO_DATETIME__: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "CONTEUDO_SINCRONO",
    timestamps: false,
  }
);

module.exports = ConteudoSincrono;
