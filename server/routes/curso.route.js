const express = require("express");
const router = express.Router();
const {
  getCursos,
  getCursoById,
} = require("../controllers/curso.controller.js");
