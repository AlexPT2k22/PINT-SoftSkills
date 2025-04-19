const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const FrequenciaAssincrono = sequelize.define(
  "FREQUENCIA_ASSINCRONO",
  {
    ID_FREQUENCIA_ASSINCRONO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_OCORRENCIA: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "OCORRENCIA_ASSINCRONA",
        key: "ID_OCORRENCIA",
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
    PROGRESSO: {
      type: Sequelize.NUMERIC,
      allowNull: true,
    },
    N_HORAS_EM_CURSO_SINCRONO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    DATA_INICIO_FREQUENCIA: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    DATA_FIM_FREQUENCIA__: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "FREQUENCIA_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = FrequenciaAssincrono;
