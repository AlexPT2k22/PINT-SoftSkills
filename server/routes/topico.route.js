const express = require("express");
const router = express.Router();
const topicoController = require("../controllers/topico.controller");
const { authenticateToken } = require("../middlewares/authmiddleware");

router.get("/", topicoController.getAllTopicos);
router.get("/by-area/:areaId", topicoController.getTopicosByArea);
router.post("/", authenticateToken, topicoController.createTopico);
router.put("/:id", authenticateToken, topicoController.updateTopico);
router.delete("/:id", authenticateToken, topicoController.deleteTopico);

module.exports = router;
