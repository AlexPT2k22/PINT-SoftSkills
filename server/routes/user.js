const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  getTeachers,
  getCursosAssociados,
  inscreverEmCurso,
  verificarInscricao,
  getCursosInscritos,
  updateUser,
  getUsers,
  getProfiles,
  changeUser,
  getUser,
  getUserStatistics,
  completeModule,
  updateEvaluationGrade,
  getNotaMediaCompleta,
  addTeacher,
  getNotaMediaAvaliacoesFinais,
} = require("../controllers/user.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

// rota para /user/*
router.get("/", authenticateToken, getUsers);

router.post("/complete-module", authenticateToken, completeModule);
router.post(
  "/update-evaluation-grade",
  authenticateToken,
  updateEvaluationGrade
);
router.get("/teachers", getTeachers);
router.get("/nota-media", authenticateToken, getNotaMediaCompleta);
router.get(
  "/nota-media-avaliacoes-finais",
  authenticateToken,
  getNotaMediaAvaliacoesFinais
);
router.post("/add-teacher", authenticateToken, addTeacher);
router.get("/teacher-courses", authenticateToken, getCursosAssociados);
router.get("/student-courses", authenticateToken, getCursosInscritos);
router.post("/enter-course/:courseId", authenticateToken, inscreverEmCurso);
router.post("/verify-course/:courseId", authenticateToken, verificarInscricao);
router.post("/change-name", authenticateToken, updateUser);
router.get("/profiles", authenticateToken, getProfiles);
router.put("/:id", authenticateToken, changeUser);
router.get("/:id", getUser);
router.get("/:id/statistics", getUserStatistics);

module.exports = router;
