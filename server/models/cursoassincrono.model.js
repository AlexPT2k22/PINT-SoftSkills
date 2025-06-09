const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const CursoAssincrono = sequelize.define(
  "CURSO_ASSINCRONO",
  {
    ID_CURSO_ASSINCRONO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    ESTADO: {
      type: DataTypes.ENUM("Ativo", "Inativo", "Em curso", "Terminado"),
      defaultValue: "Ativo",
      allowNull: false,
    },
    NUMERO_CURSOS_ASSINCRONOS: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DATA_INICIO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DATA_FIM: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "CURSO_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = CursoAssincrono;
