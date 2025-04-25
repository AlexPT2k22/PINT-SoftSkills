const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Curso = sequelize.define(
  "CURSO",
  {
    ID_CURSO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ID_AREA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AREA",
        key: "ID_AREA",
      },
    },
    IMAGEM: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    IMAGEM_PUBLIC_ID: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    NOME: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DESCRICAO_OBJETIVOS__: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DIFICULDADE_CURSO__: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DATA_CRIACAO__: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "CURSO",
    timestamps: false,
  }
);

module.exports = Curso;
