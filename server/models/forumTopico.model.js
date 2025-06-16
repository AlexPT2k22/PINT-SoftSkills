const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ForumTopico = sequelize.define(
  "FORUM_TOPICO",
  {
    ID_FORUM_TOPICO: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    ID_CRIADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    TITULO: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ESTADO: {
      type: DataTypes.ENUM("Ativo", "Inativo", "Denunciado"),
      defaultValue: "Ativo",
    },
    TOTAL_POSTS: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ULTIMO_POST_DATA: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "FORUM_TOPICO",
    timestamps: false,
  }
);

module.exports = ForumTopico;
