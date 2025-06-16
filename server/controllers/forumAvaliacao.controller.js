const {
  ForumAvaliacao,
  ForumPost,
  Utilizador,
} = require("../models/index.js");
const { Op } = require("sequelize");

// Avaliar post (like/dislike)
const avaliarPost = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { postId } = req.params;
    const { tipo } = req.body; // "LIKE" ou "DISLIKE"

    if (!["LIKE", "DISLIKE"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de avaliação inválido",
      });
    }

    const post = await ForumPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário já avaliou este post
    const avaliacaoExistente = await ForumAvaliacao.findOne({
      where: {
        ID_FORUM_POST: postId,
        ID_UTILIZADOR: userId,
      },
    });

    if (avaliacaoExistente) {
      if (avaliacaoExistente.TIPO === tipo) {
        // Remover avaliação se for a mesma
        await avaliacaoExistente.destroy();
        await atualizarContadoresPost(postId);
        
        return res.status(200).json({
          success: true,
          message: "Avaliação removida",
          action: "removed",
        });
      } else {
        // Atualizar avaliação se for diferente
        await avaliacaoExistente.update({ TIPO: tipo });
        await atualizarContadoresPost(postId);
        
        return res.status(200).json({
          success: true,
          message: "Avaliação atualizada",
          action: "updated",
          tipo,
        });
      }
    } else {
      // Criar nova avaliação
      await ForumAvaliacao.create({
        ID_FORUM_POST: postId,
        ID_UTILIZADOR: userId,
        TIPO: tipo,
      });
      
      await atualizarContadoresPost(postId);
      
      return res.status(201).json({
        success: true,
        message: "Avaliação criada",
        action: "created",
        tipo,
      });
    }
  } catch (error) {
    console.error("Erro ao avaliar post:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Função para atualizar contadores de likes/dislikes
const atualizarContadoresPost = async (postId) => {
  try {
    const totalLikes = await ForumAvaliacao.count({
      where: { ID_FORUM_POST: postId, TIPO: "LIKE" },
    });

    const totalDislikes = await ForumAvaliacao.count({
      where: { ID_FORUM_POST: postId, TIPO: "DISLIKE" },
    });

    await ForumPost.update(
      {
        TOTAL_LIKES: totalLikes,
        TOTAL_DISLIKES: totalDislikes,
      },
      { where: { ID_FORUM_POST: postId } }
    );
  } catch (error) {
    console.error("Erro ao atualizar contadores:", error);
  }
};

// Obter avaliações de um post
const getAvaliacoesPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const avaliacoes = await ForumAvaliacao.findAll({
      where: { ID_FORUM_POST: postId },
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
      ],
      order: [["DATA_CRIACAO", "DESC"]],
    });

    const resumo = {
      totalLikes: avaliacoes.filter((av) => av.TIPO === "LIKE").length,
      totalDislikes: avaliacoes.filter((av) => av.TIPO === "DISLIKE").length,
      avaliacoes: avaliacoes,
    };

    res.status(200).json({
      success: true,
      ...resumo,
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  avaliarPost,
  getAvaliacoesPost,
  atualizarContadoresPost,
};