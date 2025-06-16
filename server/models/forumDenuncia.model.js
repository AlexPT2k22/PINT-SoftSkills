const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/database.js");

const ForumDenuncia = sequelize.define(
  "FORUM_DENUNCIA",
  {
    ID_FORUM_DENUNCIA: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ID_FORUM_POST: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "FORUM_POST",
        key: "ID_FORUM_POST",
      },
    },
    ID_DENUNCIANTE: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "UTILIZADOR",
        key: "ID_UTILIZADOR",
      },
    },
    MOTIVO: {
      type: DataTypes.ENUM(
        "Spam",
        "Conteudo_Inadequado",
        "Linguagem_Ofensiva",
        "Informacao_Falsa",
        "Outro"
      ),
      allowNull: false,
    },
    DESCRICAO: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ESTADO: {
      type: DataTypes.ENUM("Pendente", "Analisado", "Rejeitado"),
      defaultValue: "Pendente",
    },
    DATA_CRIACAO: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "FORUM_DENUNCIA",
    timestamps: false,
  }
);

module.exports = ForumDenuncia;
