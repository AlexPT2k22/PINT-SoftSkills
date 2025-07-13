const { Router } = require("express");
const router = Router();
const {
  createAvaliacao,
  getAvaliacoesByCurso,
  updateAvaliacao,
  deleteAvaliacao,
  getMinhasSubmissoesByCurso,
  getSubmissoesByAvaliacao,
  submeterTrabalho,
  updateSubmissao,
  deleteSubmissao,
  avaliarSubmissao,
  getProximasAvaliacoes,
} = require("../controllers/avaliacaoSincrona.controller.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.get("/curso/:cursoId", authenticateToken, getAvaliacoesByCurso);
router.post("/", authenticateToken, createAvaliacao);
router.put("/:id", authenticateToken, updateAvaliacao);
router.delete("/:id", authenticateToken, deleteAvaliacao);
router.get(
  "/minhas-submissoes/:cursoId",
  authenticateToken,
  getMinhasSubmissoesByCurso
);
router.get(
  "/:avaliacaoId/submissoes",
  authenticateToken,
  getSubmissoesByAvaliacao
);
router.post(
  "/submeter",
  authenticateToken,
  upload.single("ARQUIVO"),
  submeterTrabalho
);
router.put(
  "/submissao/:id",
  authenticateToken,
  upload.single("ARQUIVO"),
  updateSubmissao
);
router.delete("/submissao/:id", authenticateToken, deleteSubmissao);
router.post("/avaliar-submissao", authenticateToken, avaliarSubmissao);
router.get("/proximas", authenticateToken, getProximasAvaliacoes);
module.exports = router;
