const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const AvaliacaoSincrona = sequelize.define(
  "AVALIACAO_SINCRONA",
  {
    ID_AVALIACAO_SINCRONA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    TITULO: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    CRITERIOS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DATA_LIMITE_REALIZACAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ESTADO: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pendente",
    },
  },
  {
    tableName: "AVALIACAO_SINCRONA",
    timestamps: false,
  }
);

module.exports = AvaliacaoSincrona;
