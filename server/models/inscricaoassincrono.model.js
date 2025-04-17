const Sequelize = require("sequelize");
const sequelize = require("../database/database.js");

const InscricaoAssincrono = sequelize.define(
  "INSCRICAO_ASSINCRONO",
  {
    ID_INSCRICAO_SINCRONO2: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_OCORRENCIA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "OCORRENCIA_ASSINCRONA",
        key: "ID_OCORRENCIA",
      },
    },
    FORMULARIO_INSCRICAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    DATA_INSCRICAO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    DATA_LIMITE_INSCRICAO_AS: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "INSCRICAO_ASSINCRONO",
    timestamps: false,
  }
);

module.exports = InscricaoAssincrono;
