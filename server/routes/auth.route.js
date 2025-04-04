const express = require("express");
const router = express.Router();
const {
  register,
  login,
  linkedIN_url,
  linkedINLogin,
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

module.exports = router;
