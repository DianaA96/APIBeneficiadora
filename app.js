const express = require('express');
//const cors = require('cors');
require('dotenv').config()
const mysql = require ('mysql');
const config = require('./helpers/config')
//const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8080; //Especifica el puerto
//app.use(cors());


var indexRouter = require('./routes/index');
var gerenteRouter = require('./routes/gerente');
var operadorRouter = require('./Routes/Operador');
var usuarioRouter = require('./Routes/Usuario')
var adminRouter = require('./Routes/Admin');
var labRouter = require('./Routes/Lab');

app.use(express.json());
app.use('/admin',adminRouter)
app.use('/usuario', usuarioRouter)
app.use('/lab', labRouter)
app.use('/operador', operadorRouter)
app.use('/gerente', gerenteRouter)

// Levantar el servidor
app.listen(port, () => {
    console.log(`The server is runnig in port ${port}`)
})

// Atrapa todos los errores
const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected'); 
});



  
