const Sequelize = require("sequelize");
const { sequelize } = require("../database/database.js");

const CursoAssincrono = sequelize.define(
  "CURSO_ASSINCRONO",
  {
    ID_CURSO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    QUANTIDADE_CURSOS_ASSINCRONOS__: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "CURSO_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = CursoAssincrono;
