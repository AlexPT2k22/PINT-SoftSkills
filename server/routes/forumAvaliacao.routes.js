
const express = require("express");
const router = express.Router();
const {
  avaliarPost,
  getAvaliacoesPost,
} = require("../controllers/forumAvaliacao.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.get("/post/:postId", getAvaliacoesPost);
router.post("/post/:postId", authenticateToken, avaliarPost);

module.exports = router;