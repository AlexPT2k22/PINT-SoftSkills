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
} = require("../controllers/user.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

// rota para /user/*
router.get("/", authenticateToken, getUsers);

router.get("/teachers", getTeachers);
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
