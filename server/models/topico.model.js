const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Topico = sequelize.define(
  "TOPICO",
  {
    ID_TOPICO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_AREA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AREA",
        key: "ID_AREA",
      },
    },
    TITULO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "TOPICO",
    timestamps: false,
  }
);

module.exports = Topico;
