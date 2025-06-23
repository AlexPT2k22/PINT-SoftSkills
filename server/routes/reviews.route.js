const express = require("express");
const router = express.Router();
const {
  createOrUpdateReview,
  getReviewsByCurso,
  getMyReview,
  deleteReview,
} = require("../controllers/reviews.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

// Criar ou atualizar review
router.post("/:cursoId", authenticateToken, createOrUpdateReview);

//reviews de um curso (público)
router.get("/:cursoId", getReviewsByCurso);

//review para um curso, a minha
router.get("/:cursoId/my-review", authenticateToken, getMyReview);

// Eliminar review
router.delete("/:cursoId", authenticateToken, deleteReview);

module.exports = router;
