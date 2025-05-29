const { Router } = require("express");
const router = Router();
const {
  createAvaliacao,
  getAvaliacoesByCurso,
  updateAvaliacao,
  getMinhasSubmissoesByCurso,
  getSubmissoesByAvaliacao,
  submeterTrabalho,
  avaliarSubmissao,
  getProximasAvaliacoes,
} = require("../controllers/avaliacaoSincrona.controller.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.get("/curso/:cursoId", authenticateToken, getAvaliacoesByCurso);
router.post("/", authenticateToken, createAvaliacao);
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
router.post("/avaliar-submissao", authenticateToken, avaliarSubmissao);
router.get("/proximas", authenticateToken, getProximasAvaliacoes);
module.exports = router;
