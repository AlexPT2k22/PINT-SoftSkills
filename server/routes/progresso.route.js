const express = require("express");
const router = express.Router();
const {
  getCursoProgresso,
  getModulosProgresso,
} = require("../controllers/progresso.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.get("/courses/:courseId/progress", authenticateToken, getCursoProgresso);

router.get(
  "/courses/:courseId/modules/progress",
  authenticateToken,
  getModulosProgresso
);

module.exports = router;
