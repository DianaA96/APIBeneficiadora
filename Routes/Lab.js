var express = require('express');
var router = express.Router();

var controller = require('../Controller/labController')

router.post('/labReport', controller.LabReport)
router.get('/labTable', controller.LabTable)
/*
router.get('/labList', controller.LabHistory)
*/

module.exports = router