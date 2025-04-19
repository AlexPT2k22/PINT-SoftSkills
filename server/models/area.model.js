const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Area = sequelize.define(
  "Area",
  {
    ID_AREA: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    ID_CATEGORIA__PK___: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "CATEGORIA",
        key: "ID_CATEGORIA__PK___",
      },
    },
    NOME: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "AREA",
    timestamps: false,
  }
);

module.exports = Area;
