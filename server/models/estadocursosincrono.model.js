const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const EstadoCursoSincrono = sequelize.define(
  "EstadoCursoSincrono",
  {
    ID_ESTADO_OCORRENCIA_ASSINCRONA2: {
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
    tableName: "ESTADO_CURSO_SINCRONO",
    timestamps: false,
  }
);

module.exports = EstadoCursoSincrono;
