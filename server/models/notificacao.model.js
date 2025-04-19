const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Notificacao = sequelize.define(
  "NOTIFICACAO",
  {
    ID_NOTIFICACAO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    TIPO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    TITULO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    MENSAGEM: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DATA_ENVIO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "NOTIFICACAO",
    timestamps: false,
  }
);

module.exports = Notificacao;
