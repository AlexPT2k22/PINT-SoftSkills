const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const AvaliacaoFinalSincrona = sequelize.define(
  "AVALIACAO_FINAL_SINCRONA",
  {
    ID_AVALIACAO_FINAL_SINCRONA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    UTI_ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    UTI_ID_UTILIZADOR2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
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
    CERTIFICADO_SINCRONO: {
      type: DataTypes.BLOB("tiny"),
      allowNull: true,
    },
    DATA_EMISSAO_CERTIFICADO: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "AVALIACAO_FINAL_SINCRONA",
    timestamps: false,
  }
);

module.exports = AvaliacaoFinalSincrona;
