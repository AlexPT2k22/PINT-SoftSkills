const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware.js");
const {
  createQuiz,
  getQuizByCurso,
  updateQuiz,
  submitQuizResponse,
  getUserQuizResult,
  getQuizStats,
  deleteQuiz,
} = require("../controllers/quizAssincrono.controller.js");

// Criar quiz para curso
router.post("/", authenticateToken, createQuiz);

// Obter quiz de um curso
router.get("/curso/:cursoId", authenticateToken, getQuizByCurso);

// Atualizar quiz
router.put("/:quizId", authenticateToken, updateQuiz);

// Submeter resposta ao quiz
router.post("/:quizId/resposta", authenticateToken, submitQuizResponse);

// Obter resultado do usuário
router.get("/:quizId/resultado", authenticateToken, getUserQuizResult);

// Obter estatísticas (gestores)
router.get("/:quizId/stats", authenticateToken, getQuizStats);

// Deletar quiz
router.delete("/:quizId", authenticateToken, deleteQuiz);

module.exports = router;