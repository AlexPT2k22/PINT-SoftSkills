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

router.post("/", (req, res) => {
  const user = req.body; //teste
  if (!user.Name || !user.Pass) {
    return res
      .status(400)
      .json({ error: "O campo Name e Pass são obrigatórios!" });
  }
  users.push(user); // Adiciona o novo utilizador ao array de utilizadores
  fs.writeFile(
    usersFilePath,
    JSON.stringify(users, null, 2),
    "utf-8",
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao guardar utilizador!" });
      }
      res.json({ message: `Utilizador ${user.Name} adicionado com sucesso!` });
    }
  );
});

module.exports = router;
