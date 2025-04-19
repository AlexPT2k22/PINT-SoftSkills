const { Sequelize } = require("sequelize");
const { sequelize } = require("../database/database.js");

const AvaliaConteudoResposta = sequelize.define(
  "AVALIA_CONTEUDO_RESPOSTA",
  {
    ID_UTILIZADOR: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    ID_RESPOSTA: {
      type: Sequelize.INTEGER,
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
