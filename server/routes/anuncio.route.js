const express = require("express");
const {
  getAnunciosByCurso,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
} = require("../controllers/anuncio.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");
const router = express.Router();

router.use(authenticateToken);
router.get("/curso/:cursoId", getAnunciosByCurso);
router.post("/", createAnuncio);
router.put("/:anuncioId", updateAnuncio);
router.delete("/:anuncioId", deleteAnuncio);

module.exports = router;
