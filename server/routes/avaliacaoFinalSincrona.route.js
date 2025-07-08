const { Router } = require("express");
const router = Router();
const {
  getAvaliacoesFinaisByCurso,
  criarOuAtualizarAvaliacaoFinal,
  getMinhaAvaliacaoFinal,
  getMinhasAvaliacoesFinais,
} = require("../controllers/avaliacaoFinalSincrona.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.get("/curso/:cursoId", authenticateToken, getAvaliacoesFinaisByCurso);
router.post(
  "/curso/:cursoId/aluno/:alunoId",
  authenticateToken,
  criarOuAtualizarAvaliacaoFinal
);
router.get("/minha/:cursoId", authenticateToken, getMinhaAvaliacaoFinal);
router.get("/minhas", authenticateToken, getMinhasAvaliacoesFinais);

module.exports = router;
