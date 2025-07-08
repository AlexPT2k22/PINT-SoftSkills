const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authmiddleware.js");
const {
  getMeuPercursoFormativo,
  getDetalhesCursoPercurso,
} = require("../controllers/percursoFormativo.controller.js");

router.get("/meu", authenticateToken, getMeuPercursoFormativo);
router.get("/curso/:cursoId", authenticateToken, getDetalhesCursoPercurso);

module.exports = router;