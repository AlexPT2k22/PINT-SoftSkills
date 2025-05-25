const { Router } = require("express");
const router = Router();
const { 
  createAvaliacao, 
  getAvaliacoesByCurso, 
  updateAvaliacao 
} = require("../controllers/avaliacaoSincrona.controller.js");

router.post("/", createAvaliacao);
router.get("/curso/:cursoId", getAvaliacoesByCurso);
router.put("/:id", updateAvaliacao);

module.exports = router;