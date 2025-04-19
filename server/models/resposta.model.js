const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Resposta = sequelize.define(
  "RESPOSTA",
  {
    ID_RESPOSTA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_TOPICO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "TOPICO",
        key: "ID_TOPICO",
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
    RES_ID_RESPOSTA: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // Caso queiras, podes definir isto como uma foreign key para a própria tabela para respostas a respostas
      references: {
        model: "RESPOSTA",
        key: "ID_RESPOSTA",
      },
    },
    CONTEUDO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: DataTypes.BLOB("tiny"),
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "RESPOSTA",
    timestamps: false,
  }
);

module.exports = Resposta;
