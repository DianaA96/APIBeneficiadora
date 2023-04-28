var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/usuarioController')


router.post('/login', controller.LOGIN)

module.exports = router