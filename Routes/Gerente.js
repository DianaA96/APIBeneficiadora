var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/gerenteController')

router.get('/historial', controller.Historial)

module.exports = router