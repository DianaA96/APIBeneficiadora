var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/gerenteController')

router.get('/obtenerHumedad', controller.obtenerHumedad)
router.get('/reporteBascula', controller.reporteBascula)
router.get('/movMineral', controller.movMineral)
router.get('/embarque', controller.embarque)
router.get('/grapHistoricas', controller.grapHistoricas)
router.get('/balance', controller.balance)
router.get('/movMineralTable', controller.movMineralTable)
router.get('/reporteTable', controller.reporteTable)
router.get('/grapliquidacion', controller.grapliquidacion)
router.get('/liquidacion', controller.liquidacion)

module.exports = router