var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/gerenteController')

router.get('/historial', controller.HISTORIAL)

module.exports = router