const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const CursoAssincrono = sequelize.define(
  "CURSO_ASSINCRONO",
  {
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    NUMERO_CURSOS_ASSINCRONOS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true, // conta automaticamente os cursos assincronos
    },
  },
  {
    tableName: "CURSO_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = CursoAssincrono;
