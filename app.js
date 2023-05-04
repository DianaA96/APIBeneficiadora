const express = require('express');
const cors = require('cors');
require('dotenv').config()
const mysql = require ('mysql');
const config = require('./helpers/config')
//const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 3050; //Especifica el puerto
//app.use(cors());


var indexRouter = require('./routes/index');
var gerenteRouter = require('./routes/gerente');
var operadorRouter = require('./Routes/Operador');
var usuarioRouter = require('./Routes/Usuario')
var adminRouter = require('./Routes/Admin');
var labRouter = require('./Routes/Lab');


app.use(express.json());
// Atrapa todos los errores
app.use(express.json());
app.use('/admin',adminRouter)
app.use('/usuario', usuarioRouter)
app.use('/lab', labRouter)
app.use('/operador', operadorRouter)
// Levantar el servidor
app.listen(port, () => {
    console.log(`The server is runnig in port ${port}`)
})


const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected'); 
});



  
