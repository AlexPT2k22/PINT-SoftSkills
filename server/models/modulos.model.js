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
      field: "ID_CURSO",
    },
    nome: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "NOME",
    },
    descricao: {
      type: DataTypes.TEXT,
      field: "DESCRICAO",
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
