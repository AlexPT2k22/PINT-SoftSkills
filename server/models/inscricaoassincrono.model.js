const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const InscricaoAssincrono = sequelize.define(
  "INSCRICAO_ASSINCRONO",
  {
    ID_INSCRICAO_SINCRONO2: {
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
    ID_OCORRENCIA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "OCORRENCIA_ASSINCRONA",
        key: "ID_OCORRENCIA",
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
