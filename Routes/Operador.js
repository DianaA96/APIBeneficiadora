var express = require('express');
var router = express.Router();

var controller = require('../Controller/operadorController')

router.post('/operadorReporteD', controller.operadorReporteD)
router.get('/reporteD', controller.reporteD)//g

module.exports = router