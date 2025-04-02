const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/", (req,res) => {
    const username = req.query.username;
    res.json(`Bem vindo ${username}`);
})

module.exports = router;