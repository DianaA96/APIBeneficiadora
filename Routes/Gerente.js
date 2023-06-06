var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/gerenteController')

router.get('/reporteBascula', controller.reporteBascula)
router.get('/movMineral', controller.movMineral)
router.get('/embarque', controller.embarque)
router.get('/grapHistoricas', controller.grapHistoricas)
//router.get('/historialBascula', controller.historialBascula)
router.get('/balance', controller.balance)
router.get('/balanceTable', controller.balanceTable)

module.exports = router