const express = require("express");
const router = express.Router();
const {
  getAreas,
  addArea,
  updateArea,
  deleteArea,
} = require("../controllers/area.controller.js");

// /api/areas/*
router.get("/", getAreas);
router.post("/", addArea);
router.put("/:ID_AREA", updateArea);
router.delete("/:ID_AREA", deleteArea);

module.exports = router;
