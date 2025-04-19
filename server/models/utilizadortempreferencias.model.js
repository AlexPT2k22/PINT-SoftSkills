const { sequelize } = require("../database/database.js");
const { Sequelize } = require("sequelize");

const UtilizadorTemPreferencias = sequelize.define(
  "UTILIZADOR_TEM_PREFERENCIAS",
  {
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_AREA: {
      type: Sequelize.INTEGER,
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
