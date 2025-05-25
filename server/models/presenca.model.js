const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const PresencaAula = sequelize.define(
  "PRESENCA_AULA",
  {
    ID_PRESENCA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_AULA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AULA_SINCRONA",
        key: "ID_AULA",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    PRESENTE: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    HORA_ENTRADA: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    HORA_SAIDA: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    tableName: "PRESENCA_AULA",
    timestamps: true,
  }
);

module.exports = PresencaAula;