const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "../database/users.json");
let users = require(usersFilePath);

// rota para /users
router.get("/", (req, res) => {
  res.send(users); //teste
});

// "/users/register"
router.post("/register", (req, res) => {
  const user = req.body; //teste
  if (!user.Username || !user.Password || !user.Email) {
    return res
      .status(400)
      .json({ error: "O campo Username, email e password são obrigatórios!" });
  }

  // Verifica se o utilizador já existe
  const existingUser = users.find((u) => u.Username === user.Username);
  if (existingUser) {
    console.log(`Utilizador ${user.Username} já existe!`);
    return res.status(400).json({ error: "Utilizador já existe!" });
  }
  // Verifica se o email já existe
  const existingEmail = users.find((u) => u.Email === user.Email);
  if (existingEmail) {
    console.log(`Email ${user.Email} já existe!`);
    return res.status(400).json({ error: "Email já existe!" });
  }

  users.push(user); // Adiciona o novo utilizador ao array de utilizadores
  fs.writeFile(
    usersFilePath,
    JSON.stringify(users, null, 2),
    "utf-8",
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Erro ao guardar utilizador!" });
      }
      res.json({
        message: `Utilizador ${user.Username} adicionado com sucesso!`,
      });
      console.log(`Utilizador ${user.Username} adicionado com sucesso!`);
    }
  );
});

router.post("/login", (req, res) => {
  const user = req.body;
  if (!user.Email || !user.Password) {
    // verificar os campos obrigatorios
    return res
      .status(500)
      .json({ error: "O campo Email e password são obrigatórios!" });
  }

  // verificar se o user existe
  const userExist = users.find(
    (u) => u.Email === user.Email && u.Password === user.Password
  );
  if (userExist) {
    console.log(`Sucesso`);
    res.sendStatus(200);
    // redirecionar para a dashboard
  } else {
    res.sendStatus(401).json({ error: "Email ou password errados" });
  }
});

module.exports = router;
