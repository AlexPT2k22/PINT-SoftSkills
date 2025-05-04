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
  updateCursoAssincrono,
  convertCursoType,
} = require("../controllers/curso.controller.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// /cursos/*
router.get("/", getCursos);
router.get("/popular", getCursosPopulares);
router.post("/create", upload.any(), createCurso);
router.post("/create-sincrono", upload.any(), createSincrono); // criar curso sincrono
router.post("/create-assincrono", upload.any(), createAssincrono); // criar curso assincrono
router.get("/:id", getCursoById);
router.put("/:id", upload.any(), updateCurso);
router.put("/assincrono/:id", upload.any(), updateCursoAssincrono); // atualizar curso assincrono
router.put("/sincrono/:id", upload.any(), updateCursoSincrono); // atualizar curso sincrono
router.put("/convert/:id", upload.any(), convertCursoType); // converter curso de assincrono para sincrono ou vice-versa
router.delete("/:id", deleteCurso); // deletar curso

module.exports = router;
