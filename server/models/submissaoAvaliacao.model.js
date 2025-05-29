const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const SubmissaoAvaliacao = sequelize.define(
  "SUBMISSAO_AVALIACAO",
  {
    ID_SUBMISSAO: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_AVALIACAO_SINCRONA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AVALIACAO_SINCRONA",
        key: "ID_AVALIACAO_SINCRONA",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    URL_ARQUIVO: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    DATA_SUBMISSAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    NOTA: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    OBSERVACAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ESTADO: {
      type: DataTypes.STRING,
      defaultValue: "Submetido",
    },
    DATA_AVALIACAO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "SUBMISSAO_AVALIACAO",
  }
);

module.exports = SubmissaoAvaliacao;
