const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const AvaliacaoFinalAssincrona = sequelize.define(
  "AVALIACAO_FINAL_ASSINCRONA",
  {
    ID_AVALIACAO_FINAL_SINCRONA2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_QUIZZ_ASSINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NOTA_FINAL: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    DATA_AVALIACAO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    OBSERVACAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    CERTIFICADO_ASSINCRONO: {
      type: DataTypes.BLOB("tiny"),
      allowNull: true,
    },
    DATA_EMISSAO_CERTIFICADO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "AVALIACAO_FINAL_ASSINCRONA",
    timestamps: false,
  }
);

module.exports = AvaliacaoFinalAssincrona;
