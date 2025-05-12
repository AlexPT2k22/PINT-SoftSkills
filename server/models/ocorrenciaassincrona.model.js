const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const OcorrenciaAssincrona = sequelize.define(
  "OCORRENCIA_ASSINCRONA",
  {
    ID_OCORRENCIA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_ESTADO_OCORRENCIA_ASSINCRONA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ESTADO_OCORRENCIA_ASSINCRONA",
        key: "ID_ESTADO_OCORRENCIA_ASSINCRONA",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_CURSO_ASSINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_ASSINCRONO",
        key: "ID_CURSO_ASSINCRONO",
      },
    },
    DATA_INICIO_DATETIME__: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DATA_FIM_DATETIME__: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "OCORRENCIA_ASSINCRONA",
    timestamps: false,
  }
);

module.exports = OcorrenciaAssincrona;
