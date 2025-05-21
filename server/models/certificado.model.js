const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database");

const Certificado = sequelize.define(
  "CERTIFICADO",
  {
    ID_CERTIFICADO: {
      type: DataTypes.INTEGER,
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
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    CODIGO_VERIFICACAO: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: true,
    },
    DATA_EMISSAO: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    URL_CERTIFICADO: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "CERTIFICADO",
    timestamps: false,
  }
);

module.exports = Certificado;
