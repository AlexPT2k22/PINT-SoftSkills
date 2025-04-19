const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const PedidoTopico = sequelize.define(
  "PEDIDO_TOPICO",
  {
    ID_PEDIDO: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    UTI_ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_TOPICO: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "TOPICO",
        key: "ID_TOPICO",
      },
    },
    ID_AREA: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "AREA",
        key: "ID_AREA",
      },
    },
    TITULO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    DATA_PEDIDO: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    ESTADO: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    MOTIVO_REJEICAO: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "PEDIDO_TOPICO",
    timestamps: false,
  }
);

module.exports = PedidoTopico;
