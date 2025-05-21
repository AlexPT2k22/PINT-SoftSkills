const express = require('express');
const router = express.Router();
const certificadoController = require('../controllers/certificado.controller');
const authenticateToken = require('../middlewares/authmiddleware');

router.get('/gerar/:courseId', authenticateToken, certificadoController.gerarCertificado);
router.get('/verificar/:codigo', certificadoController.verificarCertificado);

module.exports = router;