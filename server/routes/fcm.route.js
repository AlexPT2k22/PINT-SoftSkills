const express = require("express");
const {
  registerFCMToken,
  unregisterFCMToken,
  cleanupOldTokens,
} = require("../controllers/fcm.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

const router = express.Router();

router.post("/register", authenticateToken, registerFCMToken);
router.post("/unregister", authenticateToken, unregisterFCMToken);
router.delete("/cleanup", authenticateToken, cleanupOldTokens);

module.exports = router;
