const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const TrabalhoCursoSincrono = sequelize.define(
  "TRABALHO_CURSO_SINCRONO",
  {
    ID_TRABALHO: {
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
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    TITULO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ARQUIVO_CAMINHO: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    DATA_ENVIO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    NOTA: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    COMENTARIO_AVALIACAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "TRABALHO_CURSO_SINCRONO",
    timestamps: false,
  }
);

module.exports = TrabalhoCursoSincrono;
