const express = require("express");
const router = express.Router();
const {
  getTopicosForum,
  createTopicoForum,
  getTopicoForumById,
} = require("../controllers/forumTopico.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

// Rotas públicas
router.get("/", getTopicosForum);
router.get("/:id", getTopicoForumById);

// Rotas autenticadas
router.post("/", authenticateToken, createTopicoForum);

module.exports = router;