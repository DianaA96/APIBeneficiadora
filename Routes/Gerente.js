var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/gerenteController')

router.get('/movMineral', controller.movMineral)
// router.get('/embarque', embarque)
router.get('/grapHistoricas', controller.grapHistoricas)
router.get('/historialBascula', controller.historialBascula)

module.exports = router