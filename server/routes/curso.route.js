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
  getInscritos,
  checkCategoriaAssociation,
  checkAreaAssociation,
  checkTopicoAssociation,
  searchCursos,
  verifyTeacher,
  updateCursoCompleto,
} = require("../controllers/curso.controller.js");
const multer = require("multer");
const { authenticateToken } = require("../middlewares/authmiddleware.js");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// /cursos/*
router.get("/", getCursos);
router.get("/popular", getCursosPopulares);
router.post("/create", upload.any(), createCurso);
router.post("/create-sincrono", upload.any(), createSincrono); // criar curso sincrono
router.get("/search", searchCursos); // buscar cursos por nome ou descrição
router.post("/create-assincrono", upload.any(), createAssincrono); // criar curso assincrono
router.get("/:id", getCursoById);
router.put("/:id", upload.any(), updateCurso);
router.put("/assincrono/:id", upload.any(), updateCursoAssincrono); // atualizar curso assincrono
router.put("/sincrono/:id", upload.any(), updateCursoSincrono); // atualizar curso sincrono
router.put("/convert/:id", authenticateToken, upload.any(), convertCursoType); // converter curso de assincrono para sincrono ou vice-versa
router.delete("/:id", deleteCurso); // deletar curso
router.get("/:id/alunos", getInscritos);
router.get("/check-categoria/:categoriaId", checkCategoriaAssociation);
router.get("/check-area/:areaId", checkAreaAssociation);
router.get("/check-topico/:topicoId", checkTopicoAssociation);
router.get("/verify-teacher/:courseId", authenticateToken, verifyTeacher); // verificar se o usuário é formador do curso
router.put(
  "/:id/completo",
  authenticateToken,
  upload.any(),
  updateCursoCompleto
);

module.exports = router;
