const express = require("express");
const router = express.Router();
const {
  criarDenuncia,
  listarDenuncias,
  apagarDenuncia,
} = require("../controllers/forumDenuncia.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

// Rotas autenticadas
router.post("/post/:postId", authenticateToken, criarDenuncia);
router.delete("/post/:denunciaId", authenticateToken, apagarDenuncia);
router.get("/", authenticateToken, listarDenuncias);

module.exports = router;