const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ForumSolicitacao = sequelize.define(
  "FORUM_SOLICITACAO",
  {
    ID_FORUM_SOLICITACAO: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_SOLICITANTE: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_CATEGORIA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CATEGORIA",
        key: "ID_CATEGORIA__PK___",
      },
    },
    ID_AREA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AREA",
        key: "ID_AREA",
      },
    },
    ID_TOPICO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "TOPICO",
        key: "ID_TOPICO",
      },
    },
    TITULO_SUGERIDO: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    JUSTIFICATIVA: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ESTADO: {
      type: DataTypes.ENUM("Pendente", "Aprovado", "Rejeitado"),
      defaultValue: "Pendente",
    },
    ID_GESTOR_RESPOSTA: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    RESPOSTA_GESTOR: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    DATA_RESPOSTA: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "FORUM_SOLICITACAO",
    timestamps: false,
  }
);

module.exports = ForumSolicitacao;