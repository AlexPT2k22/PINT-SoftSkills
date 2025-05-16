const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ProgressoModulo = sequelize.define(
  "PROGRESSO_MODULO",
  {
    ID_PROGRESSO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    ID_MODULO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "MODULOS",
        key: "ID_MODULO",
      },
    },
    COMPLETO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    DATA_COMPLETO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "PROGRESSO_MODULO",
    timestamps: true,
  }
);

module.exports = ProgressoModulo;
