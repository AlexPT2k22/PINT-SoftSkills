const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/", (req,res) => {
    res.json("Dashboard");
})

module.exports = router;