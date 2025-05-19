const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authmiddleware.js");
const {
  getNotasPorModulo,
  criarNota,
  atualizarNota,
  apagarNota,
} = require("../controllers/notas.controller.js");

router.use(authenticateToken);
router.get("/module/:moduleId", getNotasPorModulo);
router.post("/", criarNota);
router.put("/:noteId", atualizarNota);
router.delete("/:noteId", apagarNota);

module.exports = router;
