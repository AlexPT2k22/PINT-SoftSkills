const express = require("express");
const router = express.Router();

//teste
const users = [
  {
    Name: "Alex",
    Pass: "12eq",
  },
];

// rota para /users
router.get("/", (req, res) => {
  res.send(users); //teste
});

router.post("/", (req, res) => {
  const user = req.body; //teste
  users.push(user); //teste
  res.send(`User entrou na BD: ${user.Name} com a pass ${user.Pass}`); //teste
});

module.exports = router;
