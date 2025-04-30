const express = require("express");
const router = express.Router();
require("dotenv").config();
const {
  getTeachers,
  getCursosAssociados,
} = require("../controllers/user.controller.js");
const authenticateToken = require("../middlewares/authmiddleware.js");

// rota para /user/*
router.get("/", async (req, res) => {
  res.send("lista de users"); //teste
});

router.get("/teachers", getTeachers);
router.get("/teacher-courses", authenticateToken, getCursosAssociados);

module.exports = router;
