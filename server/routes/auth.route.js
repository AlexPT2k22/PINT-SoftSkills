const express = require("express");
const router = express.Router();
const {
  register,
  login,
  linkedIN_url,
  linkedINLogin,
  verifyEmail,
  logout,
  forgotPassword,
  resetPassword,
  linkedInAssociate,
  checkauth,
} = require("../controllers/auth.controller.js");

const authenticateToken = require("../middlewares/authmiddleware.js");

// "/auth"
router.get("/", (_, res) => {
  res.json("Auth");
});

// "/auth/*"
router.get("/checkauth", authenticateToken, checkauth);
//router.get("/linkedin", linkedIN_url); FIXME:
//router.get("/linkedin/callback", linkedINLogin); FIXME:
//router.post("/linkedin/associate", linkedInAssociate); FIXME:
router.post("/register", register);
router.post("/login", login);
router.post("/verifyemail", verifyEmail);
router.post("/logout",authenticateToken, logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);

module.exports = router;
