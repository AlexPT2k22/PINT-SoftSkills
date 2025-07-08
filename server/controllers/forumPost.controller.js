const {
  ForumPost,
  ForumTopico,
  ForumAvaliacao,
  Utilizador,
} = require("../models/index.js");
const { updateTopicoCounters } = require("./forumTopico.controller.js");
const { supabaseAdmin } = require("../database/supabase.js");
const multer = require("multer");
const { Op } = require("sequelize");
const crypto = require("crypto");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|ppt|pptx|xlsx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (extname && allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido"));
    }
  },
});

const uploadToSupabase = async (file, userId) => {
  try {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `forum-attachments/${userId}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("forum-files")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("forum-files")
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
      fileName: fileName,
    };
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    throw error;
  }
};

const deleteFromSupabase = async (filePath) => {
  try {
    const { error } = await supabaseAdmin.storage
      .from("forum-files")
      .remove([filePath]);

    if (error) {
      console.warn("Warning deleting file from Supabase:", error);
    } else {
      console.log(`File deleted from Supabase: ${filePath}`);
    }
  } catch (error) {
    console.warn("Warning deleting file from Supabase:", error);
  }
};

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

    const postsProcessados = posts.map((post) => {
      const postJson = post.toJSON();

      postJson.ANEXOS = postJson.ANEXOS ? JSON.parse(postJson.ANEXOS) : [];

      const userAvaliacao = postJson.FORUM_AVALIACAOs?.find(
        (av) => av.ID_UTILIZADOR === userId
      );
      postJson.userAvaliacao = userAvaliacao?.TIPO || null;

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
    console.error("Erro ao procurar posts:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const createPost = async (req, res) => {
  try {
    const userId = req.user.ID_UTILIZADOR;
    const { topicoId, conteudo } = req.body;

    const topico = await ForumTopico.findOne({
      where: { ID_FORUM_TOPICO: topicoId, ESTADO: "Ativo" },
    });

    if (!topico) {
      return res.status(404).json({
        success: false,
        message: "Tópico não encontrado ou inativo",
      });
    }

    let anexos = [];
    const uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToSupabase(file, userId);

          const anexoData = {
            nome: file.originalname,
            url: uploadResult.publicUrl,
            path: uploadResult.path,
            tipo: file.mimetype,
            tamanho: file.size,
          };

          anexos.push(anexoData);
          uploadedFiles.push(uploadResult);
        } catch (error) {
          console.error(`❌ Error uploading ${file.originalname}:`, error);

          for (const uploaded of uploadedFiles) {
            await deleteFromSupabase(uploaded.path);
          }

          return res.status(500).json({
            success: false,
            message: `Erro ao fazer upload do arquivo ${file.originalname}`,
          });
        }
      }
    }

    const novoPost = await ForumPost.create({
      ID_FORUM_TOPICO: topicoId,
      ID_UTILIZADOR: userId,
      CONTEUDO: conteudo,
      ANEXOS: anexos.length > 0 ? JSON.stringify(anexos) : null,
    });

    await updateTopicoCounters(topicoId);

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
      message: "Post criado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao criar post:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

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

    if (post.ID_UTILIZADOR !== userId) {
      return res.status(403).json({
        success: false,
        message: "Você só pode deletar seus próprios posts",
      });
    }

    if (post.ANEXOS) {
      try {
        const anexos = JSON.parse(post.ANEXOS);

        for (const anexo of anexos) {
          if (anexo.path) {
            await deleteFromSupabase(anexo.path);
          }
        }
      } catch (error) {
        console.warn("⚠️ Error parsing or deleting attachments:", error);
      }
    }

    await post.update({ ESTADO: "Removido" });

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
    console.error("Erro ao procurar posts:", error);
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
