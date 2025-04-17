const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const AvaliacaoFinalAssincrona = sequelize.define(
  "AVALIACAO_FINAL_ASSINCRONA",
  {
    ID_AVALIACAO_FINAL_SINCRONA2: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_QUIZZ_ASSINCRONO: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "QUIZZ_ASSINCRONO",
        key: "ID_QUIZZ_ASSINCRONO",
      },
    },
    NOTA_FINAL: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    DATA_AVALIACAO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    OBSERVACAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    CERTIFICADO_ASSINCRONO: {
      type: Sequelize.BLOB("tiny"),
      allowNull: true,
    },
    DATA_EMISSAO_CERTIFICADO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "AVALIACAO_FINAL_ASSINCRONA",
    timestamps: false,
  }
);

module.exports = AvaliacaoFinalAssincrona;
