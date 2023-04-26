const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
//const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5000; //Especifica el puerto
//app.use(cors());

/* RUTAS
var indexRouter = require('./routes/index');
var gerenteRouter = require('./routes/gerente');
var operadorRouter = require('./routes/operador');
var adminRouter = require('./routes/admin');
var labRouter = require('./routes/lab');*/

app.use(bodyParser.json());
/*app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/operador', operadorRouter);
app.use('/gerente', gerenteRouter);
app.use('/laboratorista', labRouter);*/

// Atrapa todos los errores
app.use('*', (err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json({
        "name": err.name,
        "message": `${err.message}, ${err.original ? err.original : ':('}`,
    })
})

// Levantar el servidor
app.listen(port, () => {
    console.log(`The server is runnig in port ${port}`)
})



  
