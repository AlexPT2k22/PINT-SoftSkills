const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Notas = sequelize.define(
  "NOTAS",
  {
    ID_NOTA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_MODULO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "MODULOS",
        key: "ID_MODULO",
      },
    },
    TEMPO_VIDEO: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CONTEUDO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    DATA_ATUALIZACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "NOTAS",
    timestamps: false,
  }
);

module.exports = Notas;
