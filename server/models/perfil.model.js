const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Perfil = sequelize.define(
  "Perfil",
  {
    ID_PERFIL: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    PERFIL: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "PERFIL",
    timestamps: false,
  }
);

module.exports = Perfil;
