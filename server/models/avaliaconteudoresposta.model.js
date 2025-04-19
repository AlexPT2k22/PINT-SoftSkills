const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const AvaliaConteudoResposta = sequelize.define(
  "AVALIA_CONTEUDO_RESPOSTA",
  {
    ID_UTILIZADOR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_RESPOSTA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "RESPOSTA",
        key: "ID_RESPOSTA",
      },
    },
  },
  {
    tableName: "AVALIA_CONTEUDO_RESPOSTA",
    timestamps: false,
  }
);

module.exports = AvaliaConteudoResposta;
