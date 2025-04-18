const { Sequelize } = require("sequelize");
const sequelize = require("../database/database.js");

const TrabalhoCursoSincrono = sequelize.define(
  "TRABALHO_CURSO_SINCRONO",
  {
    ID_TRABALHO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_CURSO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    TITULO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    ARQUIVO_CAMINHO: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    DATA_ENVIO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    NOTA: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    COMENTARIO_AVALIACAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "TRABALHO_CURSO_SINCRONO",
    timestamps: false,
  }
);

module.exports = TrabalhoCursoSincrono;
