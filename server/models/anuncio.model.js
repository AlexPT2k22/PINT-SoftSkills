const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Anuncio = sequelize.define(
  "Anuncio",
  {
    ID_ANUNCIO: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Curso",
        key: "ID_CURSO",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Utilizador",
        key: "ID_UTILIZADOR",
      },
    },
    TITULO: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CONTEUDO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ATIVO: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "Anuncio",
    timestamps: false,
  }
);

module.exports = Anuncio;
