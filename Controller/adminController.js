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

/* Este codigo genera los reportes y luego lo relaciona con las tablas 
de cada concentrado y a su vez con cada uno de los elementos */
module.exports.GenerateReport = (request, response ) => {

    var bod = request.body
    console.log(bod)
    var sql1 = `INSERT INTO Analisis(TMS,idUsuario,idMina) values(${bod.tms},${bod.idUsuario},${bod.idMina});` //Aqui se crea el reporte
    connection.query(sql1, (error, rows) =>{
        if (error){
            response.send(error)
        }else{
            let idAnalisis = rows.insertId //Guardas el id nuevo que es el id del reporte nuevo generado

            //El primer for con la funcion Object Keys lee los concentrados por nombre y los convierte en id 
            for (let i = 0; i < Object.keys(bod.Concentrados).length; i++) {
                let concentrado = Object.keys(bod.Concentrados)[i] //Se guarda el concentrado que es
                console.log(concentrado)

                //El segundo for con la funcion Object Keys lee los elementos por nombre y los convierte en id
                for (let j = 0; j < Object.keys(bod.Concentrados[concentrado]).length; j++) {
                    let elemento = Object.keys(bod.Concentrados[concentrado])[j] //Guarda el elemento que es
                    console.log(elemento)
                    let porcentaje = bod.Concentrados[concentrado][elemento] //Guarda el porcentaje del elemento
                    console.log(porcentaje)

                    //El siguiente sql almacena los valores en la tabña por medio de id.
                    var sqlIdC = `INSERT INTO Laboratorio(idAnalisis,idConcentrado,idElemento,gton) values(${idAnalisis},(SELECT idConcentrado FROM Concentrado where nombre = '${concentrado}'),(SELECT idElemento FROM Elemento where nombre = '${elemento}'),${porcentaje})`
                    connection.query(sqlIdC, (error, rows) =>{
                    if (error){
                        response.send(error)
                    }else{
                        //Hasta el momento no retorna nada, la peticion no tiene respuesta aun pero ya guarda en DB
                        console.log(rows)
                        }
                    })
                    
                }
            }
        }
    })

}
