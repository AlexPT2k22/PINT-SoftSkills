const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const FCMToken = sequelize.define(
  "FCM_TOKEN",
  {
    ID_FCM_TOKEN: {
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
    TOKEN: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    DEVICE_TYPE: {
      type: DataTypes.ENUM('android', 'ios', 'web'),
      allowNull: false,
      defaultValue: 'android',
    },
    DEVICE_ID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    APP_VERSION: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ATIVO: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    DATA_ATUALIZACAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "FCM_TOKEN",
    timestamps: false,
  }
);

module.exports = FCMToken;