const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected Usuario'); 
});

module.exports.LOGIN  =  async(request, response) =>{
    bod = request.body
    var sql = `SELECT * FROM Usuario WHERE email = '${bod.email}' and isDeleted = false`
    connection.query(sql, async(error, results, fields) => {
        if (error) 
            response.send(error)
        if (results == "") {
            return response.status(404).json({
                message: `Correo o contraseña incorrectos`
            })
        }else{
            
            console.log(results)
            const isMatch = await bcrypt.compare(bod.password, results[0].password);
            if (isMatch) {
                
                const payload = {
                    user: {
                        idUsuario: results[0].idUsuario,
                        nombre: results[0].nombre,
                        apellidoP: results[0].apellidoP,
                        apellidoM: results[0].apellidoM,
                        telfono: results[0].telfono,
                        email: results[0].email,
                        idRole: results[0].idRol
                    }
                };

                console.log(payload.user)
                jwt.sign(payload, 'dbpurisima', { expiresIn: '8h' }, (err, token) => {
                    if (err) {
                        console.error(`Error en la generación del token, ${err.message}`);
                        throw err;
                    }

                    const idUsuario = payload.user.idUsuario
                    const idRol = payload.user.idRole
                    console.log(`Token generado correctamente`);
                    return response.json({token,idUsuario,idRol});
                });
            }else{
                return response.status(404).json({
                    message: `Correo o contraseña incorrectos`
                })
            }
        }
        
    });
    

}