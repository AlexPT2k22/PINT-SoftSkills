const express = require("express");
const router = express.Router();
const {
  getTopicosForum,
  createTopicoForum,
  getTopicoForumById,
  countTopicos,
} = require("../controllers/forumTopico.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.get("/", getTopicosForum);
router.get("/count", countTopicos);
router.get("/:id", getTopicoForumById);
router.post("/", authenticateToken, createTopicoForum);

module.exports = router;
