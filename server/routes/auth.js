const express = require("express");
const fs = require("fs");
const pool = require("../database.js");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const path = require("path");
const usersFilePath = path.join(__dirname, "../database/users.json");
let users = require(usersFilePath);
const linkedin_url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&state=foobar&scope=openid%20profile%20email`;

const JWT_SECRET = process.env.JWT_SECRET;

// "/auth"
router.get("/", (_, res) => {
  res.json("Auth");
});

router.get("/linkedin", (_, res) => {
  res.redirect(linkedin_url);
});

router.get("/linkedin/callback", async (req, res) => {
  const { code } = req.query;
  //console.log("Code:", code);

  if (!code) {
    return res.status(400).json({ error: "Código não encontrado!" });
  }

  try {
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
    //console.log("Access Token:", accessToken);

    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const userProfile = profileResponse.data;
    const LinkedinUsername = userProfile.name;
    const email = userProfile.email;
    //console.log("Username:", username);
    //console.log("Email:", email);

    //res.redirect(`http://localhost:8080/dashboard?username=${username}`);

    // verificar se o user existe
    const userExist = users.find(
      (u) => u.Email === email && u.Username === LinkedinUsername
    );
    if (userExist) {
      console.log(`Sucesso`);
      return res.redirect(
        `http://localhost:8080/dashboard?username=${LinkedinUsername}`
      );
    } else {
      return res.status(401).json({ error: "User não existe" });
      // TODO: adicionar o user a db
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao autenticar com o LinkedIn!" });
  }
});

router.post("/register", async (req, res) => {
  const user = {
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    LinkedIN: "", // para guardar o link do linkedin
    Type: "user",
  }; //teste
  if (!user.Username || !user.Password || !user.Email) {
    return res
      .status(400)
      .json({ error: "O campo Username, email e password são obrigatórios!" });
  }

  try {
    const userExist = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      user.Email,
    ]);
    //console.log(userExist.rows.length);

    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email já existe!" });
    }

    const hashedPassword = await bcrypt.hash(user.Password, 10); // hash da password

    await pool.query(
      "INSERT INTO users (username, password, email, linkedIN) VALUES ($1, $2, $3, $4)",
      [user.Username, hashedPassword, user.Email, user.LinkedIN]
    );

    console.log("User registado com sucesso!");
    res.status(201).json({ message: "User registado com sucesso!" });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao registar" });
  }
});

router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;
  // verificar os campos obrigatorios
  if (!Email || !Password) {
    return res
      .status(500)
      .json({ error: "O campo Email e password são obrigatórios!" });
  }
  // verificar se o user existe
  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [
      Email,
    ]);
    const user = userExist.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }

    const passwordMatch = await bcrypt.compare(
      Password,
      userExist.rows[0].password
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Email ou password inválidos!" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("User autenticado com sucesso! Com token:", token);
    res.json(token);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao autenticar!" });
  }
});

module.exports = router;
