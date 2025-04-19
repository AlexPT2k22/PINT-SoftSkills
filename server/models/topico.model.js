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
    FICHEIRO: {
      type: DataTypes.BLOB("tiny"), // binary(1) mapeado para BLOB pequeno
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
