const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Perfil = sequelize.define(
  "PERFIL",
  {
    ID_PERFIL: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    PERFIL: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "PERFIL",
    timestamps: false,
  }
);

module.exports = Perfil;
