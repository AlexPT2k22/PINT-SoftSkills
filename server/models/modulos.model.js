const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const Modulos = sequelize.define(
  "MODULOS",
  {
    ID_MODULO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_CURSO: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CURSO",
        key: "ID_CURSO",
      },
    },
    NOME: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "NOME",
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    VIDEO_URL: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    FILE_URL: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue("FILE_URL");
        if (value) {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        }
        return null;
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue("FILE_URL", JSON.stringify(value));
        } else {
          this.setDataValue("FILE_URL", value);
        }
      },
    },
    TEMPO_ESTIMADO_MIN: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "MODULOS",
    timestamps: false,
  }
);

module.exports = Modulos;
