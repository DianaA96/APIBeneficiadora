var express = require('express');
var router = express.Router();

var controller = require('../Controller/operadorController')

router.post('/operadorReporteD', controller.operadorReporteD)


module.exports = router