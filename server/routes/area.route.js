const express = require("express");
const router = express.Router();
const { getAreas } = require("../controllers/area.controller.js");

// /api/areas/*
router.get("/", getAreas);

module.exports = router;
