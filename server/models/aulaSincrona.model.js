const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const AulaSincrona = sequelize.define(
  "AULA_SINCRONA",
  {
    ID_AULA: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO_SINCRONO",
        key: "ID_CURSO",
      },
    },
    ID_MODULO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "MODULOS",
        key: "ID_MODULO",
      },
    },
    TITULO: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    LINK_ZOOM: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    DATA_AULA: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    HORA_INICIO: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    HORA_FIM: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    ESTADO: {
      type: DataTypes.ENUM('Agendada', 'Em andamento', 'Concluída', 'Cancelada'),
      defaultValue: 'Agendada',
    }
  },
  {
    tableName: "AULA_SINCRONA",
    timestamps: true,
  }
);

module.exports = AulaSincrona;