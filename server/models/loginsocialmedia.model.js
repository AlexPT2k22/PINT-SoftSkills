const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const LoginSocialMedia = sequelize.define(
  "LOGIN_SOCIALMEDIA",
  {
    ID_AUTENTICACAO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    SOCIAL: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    SOCIAL_ID: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    SOCIAL_TOKEN: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    DATA_VINCULO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "LOGIN_SOCIALMEDIA",
    timestamps: false,
  }
);

module.exports = LoginSocialMedia;