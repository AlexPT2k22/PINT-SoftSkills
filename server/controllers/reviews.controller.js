const {
  Review,
  Utilizador,
  Curso,
  InscricaoSincrono,
  InscricaoAssincrono,
  CursoSincrono,
  CursoAssincrono,
} = require("../models/index.js");
const { Op } = require("sequelize");
const { sequelize } = require("../models/index.js");

// Criar ou atualizar review
const createOrUpdateReview = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { estrelas, comentario } = req.body;
    const userId = req.user.ID_UTILIZADOR;

    // Validar estrelas
    if (!estrelas || estrelas < 0 || estrelas > 5) {
      return res.status(400).json({
        success: false,
        message: "As estrelas devem estar entre 0 e 5",
      });
    }

    // Verificar se o curso existe
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return res.status(404).json({
        success: false,
        message: "Curso não encontrado",
      });
    }

    // Verificar se o utilizador está inscrito no curso
    const [inscricaoSincrona, inscricaoAssincrona] = await Promise.all([
      InscricaoSincrono.findOne({
        where: { ID_UTILIZADOR: userId },
        include: [
          {
            model: CursoSincrono,
            where: { ID_CURSO: cursoId },
          },
        ],
      }),
      InscricaoAssincrono.findOne({
        where: { ID_UTILIZADOR: userId },
        include: [
          {
            model: CursoAssincrono,
            where: { ID_CURSO: cursoId },
          },
        ],
      }),
    ]);

    if (!inscricaoSincrona && !inscricaoAssincrona) {
      return res.status(403).json({
        success: false,
        message: "Apenas alunos inscritos podem avaliar o curso",
      });
    }

    // Verificar se já existe uma review
    const reviewExistente = await Review.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: cursoId,
      },
    });

    let review;
    if (reviewExistente) {
      // Atualizar review existente
      await reviewExistente.update({
        ESTRELAS: estrelas,
        COMENTARIO: comentario || null,
        DATA_ATUALIZACAO: new Date(),
      });
      review = reviewExistente;
    } else {
      // Criar nova review
      review = await Review.create({
        ID_UTILIZADOR: userId,
        ID_CURSO: cursoId,
        ESTRELAS: estrelas,
        COMENTARIO: comentario || null,
        DATA_CRIACAO: new Date(),
      });
    }

    // Buscar review com dados do utilizador
    const reviewCompleta = await Review.findByPk(review.ID_REVIEW, {
      include: [
        {
          model: Utilizador,
          as: "UTILIZADOR",
          attributes: ["NOME", "USERNAME"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: reviewExistente
        ? "Review atualizada com sucesso"
        : "Review criada com sucesso",
      review: reviewCompleta,
    });
  } catch (error) {
    console.error("Erro ao criar/atualizar review:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Buscar reviews de um curso
const getReviewsByCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { ID_CURSO: cursoId },
      include: [
        {
          model: Utilizador,
          as: "UTILIZADOR",
          attributes: ["NOME", "USERNAME"],
        },
      ],
      order: [["DATA_CRIACAO", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Calcular estatísticas usando query SQL direto
    const estatisticasResult = await sequelize.query(`
      SELECT 
        AVG("ESTRELAS") as "mediaEstrelas",
        COUNT("ID_REVIEW") as "totalReviews",
        COUNT(CASE WHEN "ESTRELAS" = 5 THEN 1 END) as "estrelas5",
        COUNT(CASE WHEN "ESTRELAS" = 4 THEN 1 END) as "estrelas4",
        COUNT(CASE WHEN "ESTRELAS" = 3 THEN 1 END) as "estrelas3",
        COUNT(CASE WHEN "ESTRELAS" = 2 THEN 1 END) as "estrelas2",
        COUNT(CASE WHEN "ESTRELAS" = 1 THEN 1 END) as "estrelas1",
        COUNT(CASE WHEN "ESTRELAS" = 0 THEN 1 END) as "estrelas0"
      FROM "REVIEW"
      WHERE "ID_CURSO" = :cursoId
    `, {
      replacements: { cursoId },
      type: sequelize.QueryTypes.SELECT
    });

    const estatisticas = estatisticasResult[0] || {};

    res.status(200).json({
      success: true,
      reviews,
      estatisticas: {
        mediaEstrelas: parseFloat(estatisticas.mediaEstrelas || 0).toFixed(1),
        totalReviews: parseInt(estatisticas.totalReviews || 0),
        distribuicao: {
          5: parseInt(estatisticas.estrelas5 || 0),
          4: parseInt(estatisticas.estrelas4 || 0),
          3: parseInt(estatisticas.estrelas3 || 0),
          2: parseInt(estatisticas.estrelas2 || 0),
          1: parseInt(estatisticas.estrelas1 || 0),
          0: parseInt(estatisticas.estrelas0 || 0),
        },
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar reviews:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Buscar review específica do utilizador para um curso
const getMyReview = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    const review = await Review.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: cursoId,
      },
      include: [
        {
          model: Utilizador,
          as: "UTILIZADOR",
          attributes: ["NOME", "USERNAME"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Erro ao buscar review do utilizador:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Eliminar review
const deleteReview = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const userId = req.user.ID_UTILIZADOR;

    const review = await Review.findOne({
      where: {
        ID_UTILIZADOR: userId,
        ID_CURSO: cursoId,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review não encontrada",
      });
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: "Review eliminada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao eliminar review:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

module.exports = {
  createOrUpdateReview,
  getReviewsByCurso,
  getMyReview,
  deleteReview,
};