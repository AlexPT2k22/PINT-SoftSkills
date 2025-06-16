const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ForumAvaliacao = sequelize.define(
  "FORUM_AVALIACAO",
  {
    ID_FORUM_AVALIACAO: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_FORUM_POST: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "FORUM_POST",
        key: "ID_FORUM_POST",
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
    TIPO: {
      type: DataTypes.ENUM("LIKE", "DISLIKE"),
      allowNull: false,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "FORUM_AVALIACAO",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["ID_FORUM_POST", "ID_UTILIZADOR"],
      },
    ],
  }
);

module.exports = ForumAvaliacao;
