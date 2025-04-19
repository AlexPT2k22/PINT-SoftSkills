const { sequelize } = require("../database/database.js");
const { DataTypes } = require("sequelize");

const UtilizadorTemPreferencias = sequelize.define(
  "UTILIZADOR_TEM_PREFERENCIAS",
  {
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_AREA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "AREA",
        key: "ID_AREA",
      },
    },
  },
  {
    tableName: "UTILIZADOR_TEM_PREFERENCIAS",
    timestamps: false,
  }
);

module.exports = UtilizadorTemPreferencias;
