const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const saltRounds = 10;



const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected Admin'); 
});



module.exports.CREATE = async(request,response) => {
    var bod = request.body;
    const salt = await bcrypt.genSalt(10);
    bod.password = await bcrypt.hash(bod.password, salt);
    

    var sql = `SELECT * FROM Usuario WHERE email = '${bod.email}' AND isDeleted = 0`
    connection.query(sql, (error, results, fields) =>{
        if (results.length > 0) {
            return response.status(200).json({
                message: `El usuario ya se ha registrado anteriormente`
            })
        }else{
            var bod2 = bod
            var sql2 ='INSERT INTO Usuario SET ? '
            connection.query(sql2,[bod2], (error, results, fields) =>{
                if (error) 
                response.send(error)
                return response.status(201).json({
                message: `El usuario se ha agregado con exito`
            })
        })
        }

    })
}

module.exports.DELETE = (request, response) => {
    var sql = 'UPDATE Usuario SET isDeleted = true WHERE  idUsuario = ?';
    connection.query(sql,[request.params.id], (error, results, fields) => {
        if (error) 
            response.send(error)
        return response.status(200).json({
            message: `Usuario eliminado`
        })
    });
}

module.exports.UPDATE = (request, response) => {
    id = request.params.id
    bod = request.body
    var sql = `UPDATE Usuario SET ? WHERE idUsuario = ${id}`
    connection.query(sql,[bod], (error, results, fields) => {
        if (error) 
            response.send(error)
        response.json(results)
    });
}

module.exports.List = (request, response) =>{

    var sql = 'SELECT idUsuario,nombre,apellidoP,apellidoM,ultimaConexion,telfono,email,idRol FROM Usuario WHERE isDeleted = false and idRol != 1'
    connection.query(sql, (error, rows) =>{
        if (error) 
            response.send(error)
        response.json(rows)
    })
}

module.exports.READG = (request, response ) => {
    var sql = 'SELECT idUsuario,nombre,apellidoP,apellidoM,ultimaConexion,telfono,email,idRol FROM Usuario WHERE idUsuario = ? AND isDeleted = false'
    connection.query(sql,[request.params.id], (error, results, fields) => {
        if (error) 
            response.send(error)
        response.json(results[0])
    });
}