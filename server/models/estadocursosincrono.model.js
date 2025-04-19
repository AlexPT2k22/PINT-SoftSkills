const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const EstadoCursoSincrono = sequelize.define(
  "ESTADO_CURSO_SINCRONO",
  {
    ID_ESTADO_OCORRENCIA_ASSINCRONA2: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
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
