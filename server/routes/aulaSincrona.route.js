const { Router } = require("express");
const router = Router();
const {
  createAula,
  getAulasByCurso,
  updateAulaStatus,
  marcarPresenca,
  getListaPresenca,
  getAllAulasSincronas,
} = require("../controllers/aulaSincrona.controller.js");
const { authenticateToken } = require("../middlewares/authmiddleware.js");

router.post("/", createAula);
router.get("/curso/:cursoId", getAulasByCurso);
router.put("/:aulaId", updateAulaStatus);
router.get("/all", authenticateToken, getAllAulasSincronas);
router.post("/:aulaId/presenca", marcarPresenca);
router.get("/:aulaId/presenca", getListaPresenca);

module.exports = router;
