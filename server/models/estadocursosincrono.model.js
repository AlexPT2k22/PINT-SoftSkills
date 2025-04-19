const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const EstadoCursoSincrono = sequelize.define(
  "ESTADO_CURSO_SINCRONO",
  {
    ID_ESTADO_OCORRENCIA_ASSINCRONA2: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ESTADO: {
      type: DataTypes.ENUM("Ativo", "Inativo", "Em curso", "Terminado"),
      allowNull: false,
    },
  },
  {
    tableName: "ESTADO_CURSO_SINCRONO",
    timestamps: false,
  }
);

module.exports = EstadoCursoSincrono;
