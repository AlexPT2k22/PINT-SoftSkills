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
    ID_AVALIACAO_FINAL_SINCRONA: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "AVALIACAO_FINAL_SINCRONA",
        key: "ID_AVALIACAO_FINAL_SINCRONA",
      },
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    DATA_LIMITE_REALIZACAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DATA_REALIZACAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    NOTA: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    OSERVACAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: DataTypes.BLOB("tiny"),
      allowNull: true,
    },
    ESTADO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "AVALIACAO_SINCRONA",
    timestamps: false,
  }
);

module.exports = AvaliacaoSincrona;
