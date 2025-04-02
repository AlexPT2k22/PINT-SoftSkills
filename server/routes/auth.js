const express = require("express");
const axios = require("axios");
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
  const { code } = req.query;
  console.log("Code:", code);
  if (!code) {
    return res.status(400).json({ error: "Código não encontrado!" });
  }
  try {
    const token = axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URL,
    });
    console.log("Token:", token);

    res.redirect(`http://localhost:5173/dashboard`);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Erro ao autenticar com o LinkedIn!" });
  }
});

module.exports = router;
