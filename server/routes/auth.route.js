const express = require("express");
const router = express.Router();
const {
  register,
  login,
  linkedIN_url,
  linkedINLogin,
  verifyEmail,
  logout,
} = require("../controllers/auth.controller.js");

// "/auth"
router.get("/", (_, res) => {
  res.json("Auth");
});

// "/auth/*"
router.get("/linkedin", linkedIN_url);
router.get("/linkedin/callback", linkedINLogin);
router.post("/register", register);
router.post("/login", login);
router.post("/verifyemail", verifyEmail);
router.post("/logout", logout);

module.exports = router;
