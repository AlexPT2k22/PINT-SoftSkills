const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const InscricaoSincrono = sequelize.define(
  "INSCRICAO_SINCRONO",
  {
    ID_INSCRICAO_SINCRONO: {
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
    FORMULARIO_INSCRICAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    DATA_INSCRICAO: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    DATA_LIMITE_INSCRICAO_S: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    LIMITE_VAGAS_INT__: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "INSCRICAO_SINCRONO",
    timestamps: false,
  }
);

module.exports = InscricaoSincrono;
