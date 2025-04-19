const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Area = sequelize.define(
  "AREA",
  {
    ID_AREA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ID_CATEGORIA__PK___: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CATEGORIA",
        key: "ID_CATEGORIA__PK___",
      },
    },
    NOME: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "AREA",
    timestamps: false,
  }
);

module.exports = Area;
