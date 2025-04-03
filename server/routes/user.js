const express = require("express");
const router = express.Router();
require("dotenv").config();
const path = require("path");
const usersFilePath = path.join(__dirname, "../database/users.json");
let users = require(usersFilePath);

// rota para /user
router.get("/", async (req, res) => {
  res.send(users); //teste
});

module.exports = router;
