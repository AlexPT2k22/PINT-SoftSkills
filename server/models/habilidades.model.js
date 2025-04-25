const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Habilidades = sequelize.define(
  "HABILIDADES",
  {
    ID_HABILIDADE: {
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
    tableName: "HABILIDADES",
    timestamps: false,
  }
);

module.exports = Habilidades;
