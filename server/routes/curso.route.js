const express = require("express");
const router = express.Router();
const {
  getCursos,
  getCursoById,
  createCurso,
  getCursosPopulares,
} = require("../controllers/curso.controller.js");

// /cursos/*
router.get("/", getCursos);
router.get("/popular", getCursosPopulares);
router.post("/create", createCurso);
router.get("/:id", getCursoById);

module.exports = router;
