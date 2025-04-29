const express = require("express");
const router = express.Router();
const {
  getCursos,
  getCursoById,
  createCurso,
  getCursosPopulares,
  updateCurso,
  createSincrono,
  createAssincrono,
  updateCursoSincrono,
  deleteCurso,
} = require("../controllers/curso.controller.js");
const multer = require("multer");
const storage = multer.memoryStorage(); // guarda em buffer
const upload = multer({ storage });

// /cursos/*
router.get("/", getCursos);
router.get("/popular", getCursosPopulares);
router.post("/create", upload.single("imagem"), createCurso);
router.post("/create-sincrono", upload.single("imagem"), createSincrono); // criar curso sincrono
router.post("/create-assincrono", upload.single("imagem"), createAssincrono); // criar curso assincrono
router.get("/:id", getCursoById);
router.put("/:id", upload.single("imagem"), updateCurso);
//router.put("/assincrono/:id", upload.single("imagem"), updateCurso); // atualizar curso assincrono
router.put("/sincrono/:id", upload.single("imagem"), updateCursoSincrono); // atualizar curso sincrono
router.delete("/:id", deleteCurso); // deletar curso

module.exports = router;
