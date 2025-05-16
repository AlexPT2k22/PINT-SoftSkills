const express = require("express");
const router = express.Router();
const {
  updateProgressoModulo,
  getCursoProgresso,
  getModulosProgresso,
} = require("../controllers/progresso.controller.js");
const authenticateToken = require("../middlewares/authmiddleware.js");

router.post(
  "/courses/:courseId/modules/:moduleId/complete",
  authenticateToken,
  updateProgressoModulo
);
router.get("/courses/:courseId/progress", authenticateToken, getCursoProgresso);

router.get(
  "/courses/:courseId/modules/progress",
  authenticateToken,
  getModulosProgresso
);

module.exports = router;
