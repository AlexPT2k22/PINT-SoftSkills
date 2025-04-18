const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Curso = sequelize.define(
  "Curso",
  {
    ID_CURSO: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    ID_AREA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "AREA",
        key: "ID_AREA",
      },
    },
    NOME: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DESCRICAO_OBJETIVOS__: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DIFICULDADE_CURSO__: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    DATA_CRIACAO__: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "CURSO",
    timestamps: false,
  }
);

module.exports = Curso;
