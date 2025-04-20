const express = require("express");
const router = express.Router();
const {
  getCategoriasWithAreas,
} = require("../controllers/categoria.controller.js");

// /categorias/com-areas
router.get("/com-areas", getCategoriasWithAreas);

module.exports = router;
