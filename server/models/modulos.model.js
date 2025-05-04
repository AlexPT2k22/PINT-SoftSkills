const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Modulos = sequelize.define(
  "MODULOS",
  {
    ID_MODULO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    NOME: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "NOME",
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    VIDEO_URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    FILE_URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    TEMPO_ESTIMADO_MIN: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "MODULOS",
    timestamps: false,
  }
);

module.exports = Modulos;
