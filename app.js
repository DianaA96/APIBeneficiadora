const express = require('express');
const cors = require('cors');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const mysql = require ('mysql');
const config = require('./helpers/config')
//const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 3000; //Especifica el puerto
//app.use(cors());

app.use(cors());
app.use(express.json());

var indexRouter = require('./routes/index');
var gerenteRouter = require('./routes/gerente');
var operadorRouter = require('./routes/operador');
var usuarioRouter = require('./Routes/Usuario')
var adminRouter = require('./Routes/Admin');
var labRouter = require('./routes/lab');


// Atrapa todos los errores
app.use('/admin',adminRouter)
app.use('/usuario',usuarioRouter)
// Levantar el servidor
app.listen(port, () => {
    console.log(`The server is runnig in port ${port}`)
})


const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected'); 
});



  
