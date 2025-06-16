const express = require("express");
const router = express.Router();
const {
  criarSolicitacao,
  listarSolicitacoes,
  responderSolicitacao,
} = require("../controllers/forumSolicitacao.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

// Rotas autenticadas
router.post("/", authenticateToken, criarSolicitacao);
router.get("/", authenticateToken, listarSolicitacoes);
router.put("/:solicitacaoId/responder", authenticateToken, responderSolicitacao);

module.exports = router;