const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const InscricaoSincrono = sequelize.define(
  "INSCRICAO_SINCRONO",
  {
    ID_INSCRICAO_SINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_CURSO_SINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    FORMULARIO_INSCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DATA_INSCRICAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DATA_LIMITE_INSCRICAO_S: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "INSCRICAO_SINCRONO",
    timestamps: false,
  }
);

module.exports = InscricaoSincrono;
