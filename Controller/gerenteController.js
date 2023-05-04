const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected gerente'); 
});

module.exports.HISTORIAL = (request, response) =>{
    var sql = 'SELECT idMina, nombre, fecha, SUM(acarreo) FROM mina JOIN acarreo USING(idMina) JOIN movimiento_mineral USING(idMovimiento) WHERE fecha = ? GROUP BY (nombre)'
    connection.query(sql, (error, rows) =>{
        if (error) 
            response.send(error)
        response.json(rows)
    })
}


