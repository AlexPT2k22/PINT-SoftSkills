const express = require("express");
const {
  getAnunciosByCurso,
} = require("../controllers/anuncio.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

const router = express.Router();

router.use(authenticateToken); // todas as rotas necessitam token

router.get("/curso/:cursoId", getAnunciosByCurso);

module.exports = router;