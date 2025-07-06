const express = require("express");
const {
  registerFCMToken,
  unregisterFCMToken,
  cleanupOldTokens,
} = require("../controllers/fcm.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

const router = express.Router();

// Registrar token FCM (requer autenticação)
router.post("/register", authenticateToken, registerFCMToken);

// Remover token FCM (requer autenticação)
router.post("/unregister", authenticateToken, unregisterFCMToken);

// Limpar tokens antigos (apenas para admins/gestores)
router.delete("/cleanup", authenticateToken, cleanupOldTokens);

module.exports = router;