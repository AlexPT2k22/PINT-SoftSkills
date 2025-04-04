const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

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
      required: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      required: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      required: true,
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
      defaultValue: Date.now,
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
  }
);

module.exports = User;
