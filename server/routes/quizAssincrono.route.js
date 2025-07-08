const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authmiddleware.js");
const {
  createQuiz,
  getQuizByCurso,
  updateQuiz,
  submitQuizResponse,
  getUserQuizResult,
  getQuizStats,
  deleteQuiz,
  getProximosQuizzes,
} = require("../controllers/quizAssincrono.controller.js");

router.post("/", authenticateToken, createQuiz);
router.get("/curso/:cursoId", authenticateToken, getQuizByCurso);
router.put("/:quizId", authenticateToken, updateQuiz);
router.post("/:quizId/resposta", authenticateToken, submitQuizResponse);
router.get("/:quizId/resultado", authenticateToken, getUserQuizResult);
router.get("/:quizId/stats", authenticateToken, getQuizStats);
router.delete("/:quizId", authenticateToken, deleteQuiz);
router.get("/pendentes", authenticateToken, getProximosQuizzes);

module.exports = router;
