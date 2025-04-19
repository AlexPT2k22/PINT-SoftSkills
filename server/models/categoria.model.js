const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Categoria = sequelize.define(
  "CATEGORIA",
  {
    ID_CATEGORIA__PK___: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    NOME__: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DESCRICAO__: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "CATEGORIA",
    timestamps: false,
  }
);

module.exports = Categoria;
