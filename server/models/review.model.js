const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Review = sequelize.define(
  "REVIEW",
  {
    ID_REVIEW: {
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
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    ESTRELAS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
    COMENTARIO: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "REVIEW",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["ID_UTILIZADOR", "ID_CURSO"], // Um utilizador só pode fazer uma review por curso
      },
    ],
  }
);

module.exports = Review;
