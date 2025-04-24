const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Objetivos = sequelize.define(
  "OBJETIVOS",
  {
    ID_OBJETIVO: {
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
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "OBJETIVOS",
    timestamps: false,
  }
);

module.exports = Objetivos;