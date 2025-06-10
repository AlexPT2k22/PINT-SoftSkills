const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Notificacao = sequelize.define(
  "NOTIFICACAO",
  {
    ID_NOTIFICACAO: {
      type: DataTypes.INTEGER,
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
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    TITULO: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MENSAGEM: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    TIPO: {
      type: DataTypes.ENUM(
        "ALTERACAO_FORMADOR",
        "ALTERACAO_DATA",
        "ALTERACAO_LINK_AULA",
        "INSCRICAO",
        "NOVO_CONTEUDO",
        "OUTRA"
      ),
      allowNull: false,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    LIDA: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    EMAIL_ENVIADO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "NOTIFICACAO",
    timestamps: false,
  }
);

module.exports = Notificacao;
