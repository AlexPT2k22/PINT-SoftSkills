const express = require("express");
const router = express.Router();
const {
  criarDenuncia,
  listarDenuncias,
} = require("../controllers/forumDenuncia.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

// Rotas autenticadas
router.post("/post/:postId", authenticateToken, criarDenuncia);
router.get("/", authenticateToken, listarDenuncias);

module.exports = router;