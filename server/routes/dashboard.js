const express = require("express");
const router = express.Router();

router.get("/", (req,res) => {
    const username = req.query.username;
    res.json(`Bem vindo ${username}`);
})

module.exports = router;