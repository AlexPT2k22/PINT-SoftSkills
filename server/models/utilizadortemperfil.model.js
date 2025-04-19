const { sequelize } = require("../database/database.js");
const { Sequelize } = require("sequelize");

const UtilizadorTemPerfil = sequelize.define(
  "UTILIZADOR_TEM_PERFIL",
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
    ID_PERFIL: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "PERFIL",
        key: "ID_PERFIL",
      },
    },
  },
  {
    tableName: "UTILIZADOR_TEM_PERFIL",
    timestamps: false,
  }
);

module.exports = UtilizadorTemPerfil;
