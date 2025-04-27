const express = require("express");
const router = express.Router();
const {
  getCategoriasWithAreas,
  getCategorias,
} = require("../controllers/categoria.controller.js");

// /categorias/com-areas
router.get("/com-areas", getCategoriasWithAreas);
router.get("/", getCategorias);

module.exports = router;
