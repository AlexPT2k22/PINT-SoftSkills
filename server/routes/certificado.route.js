const express = require("express");
const router = express.Router();
const {
  gerarCertificado,
  verificarCertificado,
} = require("../controllers/certificado.controller");
const {authenticateToken} = require("../middlewares/authmiddleware");

router.get("/gerar/:courseId", authenticateToken, gerarCertificado);
router.get("/verificar/:codigo", verificarCertificado);

module.exports = router;
