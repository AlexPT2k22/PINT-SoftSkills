const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const AvaliacaoFinalSincrona = sequelize.define(
  "AVALIACAO_FINAL_SINCRONA",
  {
    ID_AVALIACAO_FINAL_SINCRONA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    UTI_ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    UTI_ID_UTILIZADOR2: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
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
    CERTIFICADO_SINCRONO: {
      type: Sequelize.BLOB("tiny"),
      allowNull: true,
    },
    DATA_EMISSAO_CERTIFICADO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "AVALIACAO_FINAL_SINCRONA",
    timestamps: false,
  }
);

module.exports = AvaliacaoFinalSincrona;
