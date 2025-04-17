const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const OcorrenciaAssincrona = sequelize.define(
  "OCORRENCIA_ASSINCRONA",
  {
    ID_OCORRENCIA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_ESTADO_OCORRENCIA_ASSINCRONA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "ESTADO_OCORRENCIA_ASSINCRONA",
        key: "ID_ESTADO_OCORRENCIA_ASSINCRONA",
      },
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_CURSO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_ASSINCRONO",
        key: "ID_CURSO",
      },
    },
    DATA_INICIO_DATETIME__: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    DATA_FIM_DATETIME__: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "OCORRENCIA_ASSINCRONA",
    timestamps: false,
  }
);

module.exports = OcorrenciaAssincrona;
