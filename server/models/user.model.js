const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js"); // Importa a conexão com o banco de dados

const User = sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    linkedIn: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    role: {
      type: Sequelize.ENUM("user", "admin"),
      defaultValue: "user",
    },
    lastLogin: {
      type: Sequelize.DATE,
      defaultValue: () => new Date(),
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    resetPasswordToken: Sequelize.STRING,
    resetPasswordExpires: Sequelize.DATE,
    verificationToken: Sequelize.STRING,
    verificationExpires: Sequelize.DATE,
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
