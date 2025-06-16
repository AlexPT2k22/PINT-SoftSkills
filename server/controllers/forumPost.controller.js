const {
  ForumPost,
  ForumTopico,
  ForumAvaliacao,
  Utilizador,
} = require("../models/index.js");
const { updateTopicoCounters } = require("./forumTopico.controller.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuração do multer para anexos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/forum");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `forum_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido"));
    }
  },
});

// Listar posts de um tópico
const getPostsByTopico = async (req, res) => {
  try {
    const { topicoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.ID_UTILIZADOR;

    const offset = (page - 1) * limit;

    const { count, rows: posts } = await ForumPost.findAndCountAll({
      where: {
        ID_FORUM_TOPICO: topicoId,
        ESTADO: { [Op.in]: ["Ativo", "Editado"] },
      },
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
        {
          model: ForumAvaliacao,
          attributes: ["TIPO", "ID_UTILIZADOR"],
          required: false,
        },
      ],
      order: [["DATA_CRIACAO", "ASC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Processar posts para incluir informações de avaliação do usuário atual
    const postsProcessados = posts.map((post) => {
      const postJson = post.toJSON();
      
      // Anexos como array
      postJson.ANEXOS = postJson.ANEXOS ? JSON.parse(postJson.ANEXOS) : [];
      
      // Avaliação do usuário atual
      const userAvaliacao = postJson.ForumAvaliacaos?.find(
        (av) => av.ID_UTILIZADOR === userId
      );
      postJson.userAvaliacao = userAvaliacao?.TIPO || null;
      
      // Remover array de avaliações detalhadas
      delete postJson.ForumAvaliacaos;
      
      return postJson;
    });

    res.status(200).json({
      success: true,
      posts: postsProcessados,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasMore: offset + posts.length < count,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Criar novo post
const createPost = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { topicoId, conteudo } = req.body;

    // Verificar se o tópico existe e está ativo
    const topico = await ForumTopico.findOne({
      where: { ID_FORUM_TOPICO: topicoId, ESTADO: "Ativo" },
    });

    if (!topico) {
      return res.status(404).json({
        success: false,
        message: "Tópico não encontrado ou inativo",
      });
    }

    // Processar anexos se existirem
    let anexos = [];
    if (req.files && req.files.length > 0) {
      anexos = req.files.map((file) => ({
        nome: file.originalname,
        url: `/uploads/forum/${file.filename}`,
        tipo: file.mimetype,
        tamanho: file.size,
      }));
    }

    const novoPost = await ForumPost.create({
      ID_FORUM_TOPICO: topicoId,
      ID_UTILIZADOR: userId,
      CONTEUDO: conteudo,
      ANEXOS: anexos.length > 0 ? JSON.stringify(anexos) : null,
    });

    // Atualizar contadores do tópico
    await updateTopicoCounters(topicoId);

    // Buscar o post criado com as relações
    const postCompleto = await ForumPost.findByPk(novoPost.ID_FORUM_POST, {
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
      ],
    });

    const postJson = postCompleto.toJSON();
    postJson.ANEXOS = postJson.ANEXOS ? JSON.parse(postJson.ANEXOS) : [];
    postJson.userAvaliacao = null;

    res.status(201).json({
      success: true,
      post: postJson,
    });
  } catch (error) {
    console.error("Erro ao criar post:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Editar post
const updatePost = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { postId } = req.params;
    const { conteudo } = req.body;

    const post = await ForumPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o autor do post
    if (post.ID_UTILIZADOR !== userId) {
      return res.status(403).json({
        success: false,
        message: "Você só pode editar seus próprios posts",
      });
    }

    await post.update({
      CONTEUDO: conteudo,
      ESTADO: "Editado",
      DATA_EDICAO: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Post atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Deletar post
const deletePost = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { postId } = req.params;

    const post = await ForumPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o autor do post
    if (post.ID_UTILIZADOR !== userId) {
      return res.status(403).json({
        success: false,
        message: "Você só pode deletar seus próprios posts",
      });
    }

    await post.update({ ESTADO: "Removido" });

    // Atualizar contadores do tópico
    await updateTopicoCounters(post.ID_FORUM_TOPICO);

    res.status(200).json({
      success: true,
      message: "Post removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  getPostsByTopico,
  createPost,
  updatePost,
  deletePost,
  upload,
};