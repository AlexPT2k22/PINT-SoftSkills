const express = require("express");
const {
  getUserNotifications,
  markNotificationAsRead,
} = require("../controllers/notificacao.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

const router = express.Router();

router.use(authenticateToken);
router.get("/", getUserNotifications);
router.put("/:notificationId/read", markNotificationAsRead);

module.exports = router;
