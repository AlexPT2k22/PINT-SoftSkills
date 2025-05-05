const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  getTeachers,
  getCursosAssociados,
  inscreverEmCurso,
  verificarInscricao,
  getCursosInscritos,
} = require("../controllers/user.controller.js");
const authenticateToken = require("../middlewares/authmiddleware.js");

// rota para /user/*
router.get("/", async (req, res) => {
  res.send("lista de users"); //teste
});

router.get("/teachers", getTeachers);
router.get("/teacher-courses", authenticateToken, getCursosAssociados);
router.get("/student-courses", authenticateToken, getCursosInscritos);
router.post("/enter-course/:cursoId", authenticateToken, inscreverEmCurso);
router.get("/verify-course/:cursoId", authenticateToken, verificarInscricao);

module.exports = router;
