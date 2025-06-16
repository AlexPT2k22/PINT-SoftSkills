const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ForumPost = sequelize.define(
  "FORUM_POST",
  {
    ID_FORUM_POST: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_FORUM_TOPICO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "FORUM_TOPICO",
        key: "ID_FORUM_TOPICO",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    CONTEUDO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ANEXOS: {
      type: DataTypes.TEXT, // JSON array com URLs dos anexos
      allowNull: true,
    },
    ESTADO: {
      type: DataTypes.ENUM("Ativo", "Editado", "Denunciado", "Removido"),
      defaultValue: "Ativo",
    },
    TOTAL_LIKES: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    TOTAL_DISLIKES: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    DATA_EDICAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "FORUM_POST",
    timestamps: false,
  }
);

module.exports = ForumPost;
