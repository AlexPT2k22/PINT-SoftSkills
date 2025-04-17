const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const Notificacao = sequelize.define(
  "NOTIFICACAO",
  {
    ID_NOTIFICACAO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    TIPO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    TITULO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    MENSAGEM: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DATA_ENVIO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "NOTIFICACAO",
    timestamps: false,
  }
);

module.exports = Notificacao;
