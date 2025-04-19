const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Categoria = sequelize.define(
  "CATEGORIA",
  {
    ID_CATEGORIA__PK___: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    NOME__: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DESCRICAO__: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "CATEGORIA",
    timestamps: false,
  }
);

module.exports = Categoria;
