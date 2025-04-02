const express = require("express");
const router = express.Router();
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../database/users.json");
let users = require(usersFilePath);
const linkedin_url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&state=foobar&scope=profile%20email`;

// "/auth"
router.get("/", (req, res) => {
  res.json("Auth");
});

router.get("/linkedin", (req, res) => {
  res.redirect(linkedin_url);
});

router.get("/linkedin/callback", (req, res) => {
  try {
    const { code } = req.query;
    console.log("Code:", code);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Erro ao autenticar com o LinkedIn!" });
  }
});

module.exports = router;
