const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const Topico = sequelize.define(
  "TOPICO",
  {
    ID_TOPICO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    TITULO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    URL: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    FICHEIRO: {
      type: Sequelize.BLOB("tiny"), // binary(1) mapeado para BLOB pequeno
      allowNull: true,
    },
    DATA_CRIACAO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "TOPICO",
    timestamps: false,
  }
);

module.exports = Topico;
