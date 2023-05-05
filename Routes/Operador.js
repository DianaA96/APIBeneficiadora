var express = require('express');
var router = express.Router();

var controller = require('../Controller/operadorController')
git
router.post('/operadorReporteD', controller.operadorReporteD)
router.get('/reporteD', controller.reporteD)

module.exports = router