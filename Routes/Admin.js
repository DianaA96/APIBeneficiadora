var  express =  require('express');
var router = express.Router();

var controller = require ('../Controller/adminController')

router.get('/List',controller.List)
router.get('/individual/:id',controller.READG)
router.delete('/borrar/:id', controller.DELETE)
router.patch('/editar/:id', controller.UPDATE)
router.post('/create', controller.CREATE)
router.post('/createReport',controller.GenerateReport)
router.post('/elemento-precio', controller.EditPrecios)
router.get('/getEdit/:id', controller.GetForEdit)
router.get('/acumulados/:fecha', controller.Acumulado)
router.get('/Elementos/Actuales', controller.ValoresElemAct)
router.get('/Elementos/Historial/:fecha', controller.ValoresElemAct)
router.get('/sumaElementos', controller.SumaElementos)

module.exports = router