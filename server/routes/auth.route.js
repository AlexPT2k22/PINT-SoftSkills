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
  changeInitialPassword,
  resendVerificationCode,
} = require("../controllers/auth.controller.js");

const { authenticateToken } = require("../middlewares/authmiddleware.js");

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
router.get("/logout", authenticateToken, logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);
router.post(
  "/change-initial-password",
  authenticateToken,
  changeInitialPassword
);
router.post("/resend-verification-code", resendVerificationCode);

module.exports = router;
