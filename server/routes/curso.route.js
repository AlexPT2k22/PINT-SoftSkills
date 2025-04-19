const express = require("express");
const router = express.Router();
const {
  getCursos,
  getCursoById,
  createCurso,
} = require("../controllers/curso.controller.js");

// /cursos/*
router.get("/", getCursos);
router.post("/create", createCurso);
router.get("/:id", getCursoById);

module.exports = router;
