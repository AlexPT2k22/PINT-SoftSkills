const express = require("express");
const router = express.Router();
const {
  getCursos,
  getCursoById,
  createCurso,
  getCursosPopulares,
  updateCurso,
  createSincrono,
} = require("../controllers/curso.controller.js");
const multer = require("multer");
const storage = multer.memoryStorage(); // guarda em buffer
const upload = multer({ storage });

// /cursos/*
router.get("/", getCursos);
router.get("/popular", getCursosPopulares);
router.post("/create", upload.single("imagem"), createCurso);
router.post("/create-sincrono", upload.single("imagem"), createSincrono); // criar curso sincrono
router.get("/:id", getCursoById);
router.put("/:id", upload.single("imagem"), updateCurso);

module.exports = router;
