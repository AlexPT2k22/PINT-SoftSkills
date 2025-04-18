const { Sequelize } = require("sequelize");
const sequelize = require("../database/database.js");

const Denuncia = sequelize.define(
  "DENUNCIA",
  {
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
      primaryKey: true,
    },
    ID_RESPOSTA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "RESPOSTA",
        key: "ID_RESPOSTA",
      },
      primaryKey: true,
    },
  },
  {
    tableName: "DENUNCIA",
    timestamps: false,
  }
);

module.exports = Denuncia;
