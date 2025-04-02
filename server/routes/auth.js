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

router.get("/linkedin/callback", async (req, res) => {
  const { code } = req.query;
console.log("Code:", code);

if (!code) {
  return res.status(400).json({ error: "Código não encontrado!" });
}

try {
  // 1️⃣ Esperar pela resposta do LinkedIn
  const tokenResponse = await axios.post(
    "https://www.linkedin.com/oauth/v2/accessToken",
    null,
    {
      params: {
        grant_type: "authorization_code",
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URL,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const accessToken = tokenResponse.data.access_token;
  console.log("Access Token:", accessToken);

  // 2️⃣ Buscar o perfil do usuário com o token recebido
  const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const username = profileResponse.data.localizedFirstName;
  console.log("Username:", username);

  // 3️⃣ Redirecionar para o frontend
  res.redirect(`http://localhost:5173/`);
} catch (error) {
  console.error("Error:", error.response?.data || error.message);
  res.status(500).json({ error: "Erro ao autenticar com o LinkedIn!" });
}
});

module.exports = router;
