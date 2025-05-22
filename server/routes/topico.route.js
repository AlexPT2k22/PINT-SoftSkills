const express = require("express");
const router = express.Router();
const topicoController = require("../controllers/topico.controller");
const { authenticateToken } = require("../middlewares/authmiddleware");

// Get all topics
router.get("/", topicoController.getAllTopicos);

// Get topics by area
router.get("/by-area/:areaId", topicoController.getTopicosByArea);

// Protected routes - only for Gestor and Formador
// Create new topic
router.post("/", authenticateToken, topicoController.createTopico);

// Update topic
router.put("/:id", authenticateToken, topicoController.updateTopico);

// Delete topic
router.delete("/:id", authenticateToken, topicoController.deleteTopico);

module.exports = router;
