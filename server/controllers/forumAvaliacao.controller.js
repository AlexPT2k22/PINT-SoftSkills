const { ForumAvaliacao, ForumPost, Utilizador } = require("../models/index.js");
const { Op } = require("sequelize");

// Avaliar post (like/dislike)
const avaliarPost = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { postId } = req.params;
    const { tipo } = req.body; // "LIKE", "DISLIKE" ou null

    // Validação do tipo
    if (tipo !== null && !["LIKE", "DISLIKE"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de avaliação inválido. Use 'LIKE', 'DISLIKE' ou null.",
      });
    }

    // Verificar se o post existe
    const post = await ForumPost.findByPk(postId, {
      attributes: ["ID_FORUM_POST", "ID_UTILIZADOR", "ESTADO"],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o post está ativo
    if (!["Ativo", "Editado"].includes(post.ESTADO)) {
      return res.status(400).json({
        success: false,
        message: "Não é possível avaliar este post",
      });
    }

    // Buscar avaliação existente
    const avaliacaoExistente = await ForumAvaliacao.findOne({
      where: {
        ID_FORUM_POST: postId,
        ID_UTILIZADOR: userId,
      },
    });

    let action, message;

    if (tipo === null) {
      // Remover avaliação se existir
      if (avaliacaoExistente) {
        await avaliacaoExistente.destroy();
        action = "removed";
        message = "Avaliação removida";
      } else {
        action = "no_change";
        message = "Nenhuma avaliação para remover";
      }
    } else if (avaliacaoExistente) {
      if (avaliacaoExistente.TIPO === tipo) {
        // Remover se for a mesma avaliação
        await avaliacaoExistente.destroy();
        action = "removed";
        message = `${tipo.toLowerCase()} removido`;
      } else {
        // Atualizar se for diferente
        await avaliacaoExistente.update({ TIPO: tipo });
        action = "updated";
        message = `Avaliação alterada para ${tipo.toLowerCase()}`;
      }
    } else {
      // Criar nova avaliação
      await ForumAvaliacao.create({
        ID_FORUM_POST: postId,
        ID_UTILIZADOR: userId,
        TIPO: tipo,
      });
      action = "created";
      message = `${tipo.toLowerCase()} adicionado`;
    }

    // Atualizar contadores
    await atualizarContadoresPost(postId);

    // Buscar contadores atualizados
    const postAtualizado = await ForumPost.findByPk(postId, {
      attributes: ["TOTAL_LIKES", "TOTAL_DISLIKES"],
    });

    // Determinar o tipo final da avaliação do usuário
    const avaliacaoFinal = await ForumAvaliacao.findOne({
      where: {
        ID_FORUM_POST: postId,
        ID_UTILIZADOR: userId,
      },
      attributes: ["TIPO"],
    });

    return res.status(action === "created" ? 201 : 200).json({
      success: true,
      message,
      action,
      tipo: avaliacaoFinal?.TIPO || null,
      contadores: {
        likes: postAtualizado.TOTAL_LIKES,
        dislikes: postAtualizado.TOTAL_DISLIKES,
      },
    });
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
