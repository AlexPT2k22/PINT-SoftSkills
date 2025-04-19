const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const CursoSincrono = sequelize.define(
  "CURSO_SINCRONO",
  {
    ID_CURSO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_INSCRICAO_SINCRONO: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "INSCRICAO_SINCRONO",
        key: "ID_INSCRICAO_SINCRONO",
      },
    },
    ID_ESTADO_OCORRENCIA_ASSINCRONA2: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "ESTADO_CURSO_SINCRONO",
        key: "ID_ESTADO_OCORRENCIA_ASSINCRONA2",
      },
    },
    DATA_INICIO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    DATA_FIM: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "CURSO_SINCRONO",
    timestamps: false,
  }
);

module.exports = CursoSincrono;
