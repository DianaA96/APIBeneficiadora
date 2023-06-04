var express = require('express');
var router = express.Router();

var controller = require('../Controller/operadorController')

//router.post('/operadorReporteD', controller.operadorReporteD)
//router.post('/insertBascula', controller.insertBascula)
router.post('/insertMovimientoMineral', controller.insertMovimientoMineral)
router.post('/embarque', controller.embarque)
router.get('/reporteD', controller.reporteD)//g
//router.get('/existenciaInicial', controller.existenciaInicial)//aLaFechaEmbarque
router.get('/aLaFechaEmbarque', controller.aLaFechaEmbarque) //

module.exports = router