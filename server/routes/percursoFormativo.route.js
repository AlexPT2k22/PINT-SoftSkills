const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authmiddleware.js");
const {
  getMeuPercursoFormativo,
  getDetalhesCursoPercurso,
} = require("../controllers/percursoFormativo.controller.js");

// Rota para obter o percurso formativo completo do utilizador
router.get("/meu", authenticateToken, getMeuPercursoFormativo);

// Rota para obter detalhes específicos de um curso
router.get("/curso/:cursoId", authenticateToken, getDetalhesCursoPercurso);

module.exports = router;