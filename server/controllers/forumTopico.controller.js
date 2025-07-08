const {
  ForumTopico,
  ForumPost,
  Categoria,
  Area,
  Topico,
  Utilizador,
  UtilizadorTemPerfil,
} = require("../models/index.js");
const { Op } = require("sequelize");

const getTopicosForum = async (req, res) => {
  try {
    const { categoriaId, areaId, topicoId, page = 1, limit = 10 } = req.query;

    const whereConditions = {};

    if (categoriaId) whereConditions.ID_CATEGORIA = categoriaId;
    if (areaId) whereConditions.ID_AREA = areaId;
    if (topicoId) whereConditions.ID_TOPICO = topicoId;

    const offset = (page - 1) * limit;

    const { count, rows: topicos } = await ForumTopico.findAndCountAll({
      where: {
        ...whereConditions,
        ESTADO: "Ativo",
      },
      include: [
        {
          model: Categoria,
          as: "Categoria",
          attributes: ["ID_CATEGORIA__PK___", "NOME__"],
        },
        {
          model: Area,
          attributes: ["ID_AREA", "NOME"],
        },
        {
          model: Topico,
          attributes: ["ID_TOPICO", "TITULO"],
        },
        {
          model: Utilizador,
          as: "Criador",
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
      ],
      order: [
        ["ULTIMO_POST_DATA", "DESC"],
        ["DATA_CRIACAO", "DESC"],
      ],
      limit: parseInt(limit),
      offset: offset,
    });

    res.status(200).json({
      success: true,
      topicos: topicos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasMore: offset + topicos.length < count,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar tópicos do fórum:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const createTopicoForum = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { categoriaId, areaId, topicoId, titulo, descricao } = req.body;

    const userProfile = await UtilizadorTemPerfil.findOne({
      where: { ID_UTILIZADOR: userId, ID_PERFIL: 3 },
    });

    if (!userProfile) {
      return res.status(403).json({
        success: false,
        message: "Apenas gestores podem criar tópicos do fórum",
      });
    }

    const topicoExistente = await ForumTopico.findOne({
      where: {
        ID_CATEGORIA: categoriaId,
        ID_AREA: areaId,
        ID_TOPICO: topicoId,
        TITULO: titulo,
        ESTADO: "Ativo",
      },
    });

    if (topicoExistente) {
      return res.status(400).json({
        success: false,
        message:
          "Já existe um tópico do fórum com este título nesta categoria/área/tópico",
      });
    }

    const novoTopico = await ForumTopico.create({
      ID_CATEGORIA: categoriaId,
      ID_AREA: areaId,
      ID_TOPICO: topicoId,
      ID_CRIADOR: userId,
      TITULO: titulo,
      DESCRICAO: descricao,
    });

    const topicoCompleto = await ForumTopico.findByPk(
      novoTopico.ID_FORUM_TOPICO,
      {
        include: [
          {
            model: Categoria,
            as: "Categoria",
            attributes: ["ID_CATEGORIA__PK___", "NOME__"],
          },
          {
            model: Area,
            attributes: ["ID_AREA", "NOME"],
          },
          {
            model: Topico,
            attributes: ["ID_TOPICO", "TITULO"],
          },
          {
            model: Utilizador,
            as: "Criador",
            attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
          },
        ],
      }
    );

    res.status(201).json({
      success: true,
      topico: topicoCompleto,
    });
  } catch (error) {
    console.error("Erro ao criar tópico do fórum:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const getTopicoForumById = async (req, res) => {
  try {
    const { id } = req.params;

    const topico = await ForumTopico.findByPk(id, {
      include: [
        {
          model: Categoria,
          as: "Categoria",
          attributes: ["ID_CATEGORIA__PK___", "NOME__"],
        },
        {
          model: Area,
          attributes: ["ID_AREA", "NOME"],
        },
        {
          model: Topico,
          attributes: ["ID_TOPICO", "TITULO"],
        },
        {
          model: Utilizador,
          as: "Criador",
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
      ],
    });

    if (!topico) {
      return res.status(404).json({
        success: false,
        message: "Tópico do fórum não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      topico,
    });
  } catch (error) {
    console.error("Erro ao buscar tópico do fórum:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const updateTopicoCounters = async (topicoId) => {
  try {
    const totalPosts = await ForumPost.count({
      where: { ID_FORUM_TOPICO: topicoId, ESTADO: "Ativo" },
    });

    const ultimoPost = await ForumPost.findOne({
      where: { ID_FORUM_TOPICO: topicoId, ESTADO: "Ativo" },
      order: [["DATA_CRIACAO", "DESC"]],
    });

    await ForumTopico.update(
      {
        TOTAL_POSTS: totalPosts,
        ULTIMO_POST_DATA: ultimoPost ? ultimoPost.DATA_CRIACAO : null,
      },
      { where: { ID_FORUM_TOPICO: topicoId } }
    );
  } catch (error) {
    console.error("Erro ao atualizar contadores do tópico:", error);
  }
};

const countTopicos = async (req, res) => {
  try {
    const count = await ForumTopico.count({
      where: { ESTADO: "Ativo" },
    });

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Erro ao contar tópicos do fórum:", error);
    throw error;
  }
};

module.exports = {
  getTopicosForum,
  createTopicoForum,
  getTopicoForumById,
  updateTopicoCounters,
  countTopicos,
};
