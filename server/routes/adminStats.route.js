const express = require("express");
const router = express.Router();
const {
  getGeneralStats,
  getPercursoFormativo,
  getCursosStats,
  getDashboardCharts,
} = require("../controllers/adminStats.controller.js");
const {authenticateToken} = require("../middlewares/authmiddleware.js");

router.get("/general", authenticateToken, getGeneralStats);
router.get("/percurso-formativo", authenticateToken, getPercursoFormativo);
router.get("/cursos", authenticateToken, getCursosStats);
router.get("/charts", authenticateToken, getDashboardCharts);

module.exports = router;