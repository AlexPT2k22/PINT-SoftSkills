const express = require("express");
const router = express.Router();
const {
  getCategoriasWithAreas,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} = require("../controllers/categoria.controller.js");


router.get("/com-areas", getCategoriasWithAreas);
router.get("/", getCategorias);
router.post("/", createCategoria);
router.put("/:id", updateCategoria);
router.delete("/:id", deleteCategoria);

module.exports = router;
