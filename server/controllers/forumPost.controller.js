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
const { Op } = require("sequelize");
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuração do multer para anexos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'forum-attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xlsx'],
    resource_type: 'auto', // Automatically detect file type
    use_filename: true,
    unique_filename: true,
  },
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
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
      const userAvaliacao = postJson.FORUM_AVALIACAOs?.find(
        (av) => av.ID_UTILIZADOR === userId
      );
      postJson.userAvaliacao = userAvaliacao?.TIPO || null;

      // Remover array de avaliações detalhadas
      delete postJson.FORUM_AVALIACAOs;

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
    const { topicoId, conteudo } = req.body;
    const userId = req.user.ID_UTILIZADOR;

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

    // Processar anexos do Cloudinary
    let anexos = [];
    if (req.files && req.files.length > 0) {
      anexos = req.files.map((file) => ({
        nome: file.originalname,
        url: file.path, // Cloudinary URL
        tipo: file.mimetype,
        tamanho: file.bytes,
        public_id: file.filename, // Cloudinary public_id for deletion
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

    const postCompleto = await ForumPost.findByPk(novoPost.ID_FORUM_POST, {
      include: [
        {
          model: Utilizador,
          attributes: ["ID_UTILIZADOR", "NOME", "USERNAME"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Post criado com sucesso",
      post: postCompleto,
    });
  } catch (error) {
    console.error("Erro ao criar post:", error);
    
    // Clean up uploaded files if post creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(async (file) => {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (cleanupError) {
          console.warn('Failed to cleanup file:', cleanupError);
        }
      });
    }
    
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
    const { postId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    const post = await ForumPost.findOne({
      where: {
        ID_FORUM_POST: postId,
        ID_UTILIZADOR: userId,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post não encontrado ou sem permissão",
      });
    }

    // Delete attachments from Cloudinary
    if (post.ANEXOS) {
      try {
        const anexos = JSON.parse(post.ANEXOS);
        for (const anexo of anexos) {
          if (anexo.public_id) {
            await cloudinary.uploader.destroy(anexo.public_id);
            console.log(`Deleted attachment: ${anexo.public_id}`);
          }
        }
      } catch (error) {
        console.warn('Error deleting attachments:', error);
      }
    }

    await post.destroy();

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

const getAllPostsForum = async (req, res) => {
  try {
    const posts = await ForumPost.count({
      where: {
        ESTADO: { [Op.in]: ["Ativo", "Editado"] },
      },
    });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
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
  getAllPostsForum,
};
