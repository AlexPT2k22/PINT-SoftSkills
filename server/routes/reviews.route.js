const express = require("express");
const router = express.Router();
const {
  createOrUpdateReview,
  getReviewsByCurso,
  getMyReview,
  deleteReview,
} = require("../controllers/reviews.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.post("/:cursoId", authenticateToken, createOrUpdateReview);
router.get("/:cursoId", getReviewsByCurso);
router.get("/:cursoId/my-review", authenticateToken, getMyReview);
router.delete("/:cursoId", authenticateToken, deleteReview);

module.exports = router;
