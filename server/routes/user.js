const express = require("express");
const router = express.Router();
require("dotenv").config();
const { getTeachers } = require("../controllers/user.controller.js");

// rota para /user/*
router.get("/", async (req, res) => {
  res.send("lista de users"); //teste
});

router.get("/teachers", getTeachers);

module.exports = router;
