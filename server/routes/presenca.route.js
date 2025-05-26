const { Router } = require('express');
const router = Router();
const { registrarPresencasEmMassa } = require('../controllers/presenca.controller');

router.post('/:aulaId/massa', registrarPresencasEmMassa);

module.exports = router;