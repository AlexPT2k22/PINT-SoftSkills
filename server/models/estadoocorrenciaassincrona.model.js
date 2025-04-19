const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const EstadoOcorrenciaAssincrona = sequelize.define(
  "EstadoOcorrenciaAssincrona",
  {
    ID_ESTADO_OCORRENCIA_ASSINCRONA: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    ESTADO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "ESTADO_OCORRENCIA_ASSINCRONA",
    timestamps: false,
  }
);

module.exports = EstadoOcorrenciaAssincrona;
