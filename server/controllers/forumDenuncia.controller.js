const {
  ForumDenuncia,
  ForumPost,
  Utilizador,
  ForumTopico,
  UtilizadorTemPerfil,
} = require("../models/index.js");

// Criar denúncia
const criarDenuncia = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { postId } = req.params;
    const { motivo, descricao } = req.body;

    const motivosValidos = [
      "Spam",
      "Conteudo_Inadequado",
      "Linguagem_Ofensiva",
      "Informacao_Falsa",
      "Outro",
    ];

    if (!motivosValidos.includes(motivo)) {
      return res.status(400).json({
        success: false,
        message: "Motivo de denúncia inválido",
      });
    }

    const post = await ForumPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário já denunciou este post
    const denunciaExistente = await ForumDenuncia.findOne({
      where: {
        ID_FORUM_POST: postId,
        ID_DENUNCIANTE: userId,
      },
    });

    if (denunciaExistente) {
      return res.status(400).json({
        success: false,
        message: "Você já denunciou este post",
      });
    }

    const novaDenuncia = await ForumDenuncia.create({
      ID_FORUM_POST: postId,
      ID_DENUNCIANTE: userId,
      MOTIVO: motivo,
      DESCRICAO: descricao,
    });

    res.status(201).json({
      success: true,
      message: "Denúncia enviada com sucesso",
      denuncia: novaDenuncia,
    });
  } catch (error) {
    console.error("Erro ao criar denúncia:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Listar denúncias (apenas gestores)
const listarDenuncias = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { estado = "Pendente", page = 1, limit = 10 } = req.query;

    // Verificar se é gestor
    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!userProfile) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows: denuncias } = await ForumDenuncia.findAndCountAll({
      where: { ESTADO: estado },
      include: [
        {
          model: Utilizador,
          as: "Denunciante",
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
        {
          model: ForumPost,
          attributes: ["ID_FORUM_POST", "CONTEUDO", "ID_UTILIZADOR"],
          include: [
            {
              model: Utilizador,
              attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
            },
            {
              model: ForumTopico,
              attributes: ["ID_FORUM_TOPICO", "TITULO"],
            },
          ],
        },
      ],
      order: [["DATA_CRIACAO", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.status(200).json({
      success: true,
      denuncias: denuncias,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasMore: offset + denuncias.length < count,
      },
    });
  } catch (error) {
    console.error("Erro ao listar denúncias:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  criarDenuncia,
  listarDenuncias,
};
