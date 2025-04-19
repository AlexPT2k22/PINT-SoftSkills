const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const FrequenciaAssincrono = sequelize.define(
  "FREQUENCIA_ASSINCRONO",
  {
    ID_FREQUENCIA_ASSINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_OCORRENCIA: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "OCORRENCIA_ASSINCRONA",
        key: "ID_OCORRENCIA",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    PROGRESSO: {
      type: DataTypes.NUMERIC,
      allowNull: true,
    },
    N_HORAS_EM_CURSO_SINCRONO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DATA_INICIO_FREQUENCIA: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DATA_FIM_FREQUENCIA__: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "FREQUENCIA_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = FrequenciaAssincrono;
