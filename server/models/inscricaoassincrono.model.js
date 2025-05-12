const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const InscricaoAssincrono = sequelize.define(
  "INSCRICAO_ASSINCRONO",
  {
    ID_INSCRICAO_ASSINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_CURSO_ASSINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_ASSINCRONO",
        key: "ID_CURSO_ASSINCRONO",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
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
    DATA_LIMITE_INSCRICAO_AS: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "INSCRICAO_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = InscricaoAssincrono;
