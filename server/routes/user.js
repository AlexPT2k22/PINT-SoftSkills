const express = require("express");
const router = express.Router();
require("dotenv").config();

// rota para /user
router.get("/", async (req, res) => {
  res.send(users); //teste
});

module.exports = router;
