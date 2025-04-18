const { Sequelize } = require("sequelize");
const sequelize = require("../database/database.js");

const LoginSocialMedia = sequelize.define(
  "LOGIN_SOCIALMEDIA",
  {
    ID_AUTENTICACAO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    SOCIAL: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    SOCIAL_ID: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    SOCIAL_TOKEN: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    DATA_VINCULO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "LOGIN_SOCIALMEDIA",
    timestamps: false,
  }
);

module.exports = LoginSocialMedia;