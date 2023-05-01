var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/adminController')

router.get('/List',controller.List)
router.get('/individual/:id',controller.READG)
router.delete('/borrar/:id', controller.DELETE)
router.patch('/editar/:id', controller.UPDATE)
router.post('/create', controller.CREATE)
router.post('/createReport',controller.GenerateReport)

module.exports = router