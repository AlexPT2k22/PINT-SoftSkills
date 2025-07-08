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
  getCursosByFormador,
} = require("../controllers/curso.controller.js");
const multer = require("multer");
const { authenticateToken } = require("../middlewares/authmiddleware.js");
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get("/", getCursos);
router.get("/formador", authenticateToken, getCursosByFormador);
router.get("/popular", getCursosPopulares);
router.post("/create", upload.any(), createCurso);
router.post("/create-sincrono", upload.any(), createSincrono); 
router.get("/search", searchCursos); 
router.post("/create-assincrono", upload.any(), createAssincrono); 
router.get("/:id", getCursoById);
router.put("/:id", upload.any(), updateCurso);
router.put("/assincrono/:id", upload.any(), updateCursoAssincrono); 
router.put("/sincrono/:id", upload.any(), updateCursoSincrono); 
router.put("/convert/:id", authenticateToken, upload.any(), convertCursoType); 
router.delete("/:id", deleteCurso); 
router.get("/:id/alunos", getInscritos);
router.get("/check-categoria/:categoriaId", checkCategoriaAssociation);
router.get("/check-area/:areaId", checkAreaAssociation);
router.get("/check-topico/:topicoId", checkTopicoAssociation);
router.get("/verify-teacher/:courseId", authenticateToken, verifyTeacher); 
router.put(
  "/:id/completo",
  authenticateToken,
  upload.any(),
  updateCursoCompleto
);

module.exports = router;
