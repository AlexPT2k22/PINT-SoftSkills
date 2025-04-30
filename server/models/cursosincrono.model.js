const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const CursoSincrono = sequelize.define(
  "CURSO_SINCRONO",
  {
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_INSCRICAO_SINCRONO: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "INSCRICAO_SINCRONO",
        key: "ID_INSCRICAO_SINCRONO",
      },
    },
    ID_ESTADO_OCORRENCIA_ASSINCRONA2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ESTADO_CURSO_SINCRONO",
        key: "ID_ESTADO_OCORRENCIA_ASSINCRONA2",
      },
    },
    ESTADO: {
      type: DataTypes.ENUM("Ativo", "Inativo", "Em curso", "Terminado"),
      defaultValue: "Ativo",
      allowNull: false,
    },
    DATA_INICIO: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DATA_FIM: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    VAGAS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "CURSO_SINCRONO",
    timestamps: false,
  }
);

module.exports = CursoSincrono;
