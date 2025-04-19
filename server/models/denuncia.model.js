const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Denuncia = sequelize.define(
  "DENUNCIA",
  {
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
      primaryKey: true,
      autoIncrement: true,
    },
    ID_RESPOSTA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "RESPOSTA",
        key: "ID_RESPOSTA",
      },
      primaryKey: true,
    },
  },
  {
    tableName: "DENUNCIA",
    timestamps: false,
  }
);

module.exports = Denuncia;
