const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const PedidoTopico = sequelize.define(
  "PEDIDO_TOPICO",
  {
    ID_PEDIDO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    UTI_ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_TOPICO: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "TOPICO",
        key: "ID_TOPICO",
      },
    },
    ID_AREA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AREA",
        key: "ID_AREA",
      },
    },
    TITULO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    DATA_PEDIDO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ESTADO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    MOTIVO_REJEICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "PEDIDO_TOPICO",
    timestamps: false,
  }
);

module.exports = PedidoTopico;
