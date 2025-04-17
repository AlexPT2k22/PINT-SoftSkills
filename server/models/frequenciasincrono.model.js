const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const FrequenciaSincrono = sequelize.define(
  "FREQUENCIA_SINCRONO",
  {
    ID_FREQUENCIA_ASSINCRONO2: {
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
      allowNull: true,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
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
    tableName: "FREQUENCIA_SINCRONO",
    timestamps: false,
  }
);

module.exports = FrequenciaSincrono;
