const express = require("express");
const {
  getUserNotifications,
  markNotificationAsRead,
} = require("../controllers/notificacao.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

const router = express.Router();

// Todas as rotas de notificações precisam de autenticação
router.use(authenticateToken);

// Rotas de notificações
router.get("/", getUserNotifications);
router.put("/:notificationId/read", markNotificationAsRead);

module.exports = router;
