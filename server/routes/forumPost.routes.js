const express = require("express");
const router = express.Router();
const {
  getPostsByTopico,
  createPost,
  updatePost,
  deletePost,
  upload,
  getAllPostsForum,
} = require("../controllers/forumPost.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.get("/topico/:topicoId", getPostsByTopico);
router.get("/", getAllPostsForum);
router.post("/", authenticateToken, upload.array("anexos", 5), createPost);
router.put("/:postId", authenticateToken, updatePost);
router.delete("/:postId", authenticateToken, deletePost);

module.exports = router;
