const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const { or } = require('sequelize');

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

    var sql = 'SELECT idUsuario,nombre,apellidoP,apellidoM,ultimaConexion,telefono,email,idRol FROM Usuario WHERE isDeleted = false '
    connection.query(sql, (error, rows) =>{
        if (error) 
            response.send(error)
        response.json(rows)
    })
}

module.exports.GetForEdit = (request, response) =>{

    var sql = `SELECT idUsuario,nombre,apellidoP,apellidoM,telefono,email,idRol FROM Usuario WHERE isDeleted = false  and idUsuario = ${request.params.id}`
    connection.query(sql, (error, rows) =>{
        if (error) 
            response.send(error)
        response.json(rows)
    })
}

module.exports.READG = (request, response ) => {
    var sql = 'SELECT idUsuario,nombre,apellidoP,apellidoM,ultimaConexion,telefono,email,idRol FROM Usuario WHERE idUsuario = ? AND isDeleted = false'
    connection.query(sql,[request.params.id], (error, results, fields) => {
        if (error) 
            response.send(error)
        response.json(results[0])
    });
}

/* Este codigo genera los reportes y luego lo relaciona con las tablas 
de cada concentrado y a su vez con cada uno de los elementos */
/*module.exports.GenerateReport = (request, response ) => {

    var bod = request.body
    var sql1 = `INSERT INTO REPORTE(idMina,fecha,humedad) values(${bod.idMina},'${bod.fecha}', ${bod.humedad});` //Aqui se crea el reporte
    connection.query(sql1, (error, rows) =>{
        if (error){
            response.send(error)
        }else{
            
            let idReporte = rows.insertId //Guardas el id nuevo que es el id del reporte nuevo generado
            //El primer for con la funcion Object Keys lee los concentrados por nombre y los convierte en id 
            for (let i = 0; i < Object.keys(bod.Concentrados).length; i++) {
                let concentrado = Object.keys(bod.Concentrados)[i] //Se guarda el concentrado que es
                var json = { ...bod.Concentrados[concentrado]};
                var jsonString = JSON.stringify(json);
                var jsonSql = jsonString.replace(/'/g).replace(/(\d+)/g, "$1");
                console.log(jsonSql);
                var sqlIdC = `INSERT INTO Concentrado_Reporte(idReporte,idConcentradoJ,elementos) values(${idReporte},(SELECT idConcentradoJ FROM ConcentradoJ where nombre = '${concentrado}'),'${jsonSql}')`
                connection.query(sqlIdC, (error, rows) => {
                    if (error){
                        response.send(error)
                    }else{

                        console.log(rows)
                    }
                })
                
            }
            
            
        }
    })

}*/

module.exports.GenerateReport = (request, response ) => {
    var bod = request.body
    let now = new Date()
    let fechaSQL = now.toISOString().slice(0, 19).replace('T', ' ');
    try{
        var sqlCheck = `Select (idRep) from REPORTE Where fecha = '${bod.fecha}' and idMina = ${bod.idMina}`
        connection.query(sqlCheck, (error, results, fields) => {
            if (error) 
                response.send(error)
            if (results == "") {
                    //El primer for con la funcion Object Keys lee los concentrados por nombre y los convierte en id 
                for (let i = 0; i < Object.keys(bod.Concentrados).length; i++) {
                    let concentrado = Object.keys(bod.Concentrados)[i] //Se guarda el concentrado que es
                    
                    
                        //El segundo for con la funcion Object Keys lee los elementos por nombre y los convierte en id
                        for (let j = 1; j < Object.keys(bod.Concentrados[concentrado]).length; j++) {
                            let elemento = Object.keys(bod.Concentrados[concentrado])[j] //Guarda el elemento que es  
                            let porcentaje = bod.Concentrados[concentrado][elemento] //Guarda el porcentaje del elemento
                            let tms = bod.Concentrados[concentrado]['tms']
                
                            //El siguiente sql almacena los valores en la tabña por medio de id.
                            var sql = `INSERT INTO REPORTE(idConcentrado, idElemento, idMina, TMS, gtonR, fecha,humedad, idRep) values ((SELECT idConcentrado FROM Concentrado where nombre = '${concentrado}'),(SELECT idElemento FROM Elemento where nombre = '${elemento}'),${bod.idMina},${tms},${porcentaje},'${bod.fecha}',${bod.humedad},'${bod.idRep}');`
                
                            connection.query(sql, (error, rows) =>{
                                if (error){
                                    response.send(error)
                                }else{
                                    console.log(bod)
                                }
                            })
                                    
                        }
                    }
                    if (bod.precioConZn != undefined) {
                        var sqlPrecioZn = `INSERT INTO Precio_Concentrado(idConcentrado,precio,fecha) values ((SELECT idConcentrado FROM Concentrado where nombre = 'Zn'),${bod.precioConZn},'${fechaSQL}')`
                        connection.query(sqlPrecioZn, (error, rows) =>{
                            if (error){
                                response.send(error)
                            }
                        }) 
                    }
                
                    if(bod.precioConCu != undefined){
                        var sqlPrecioCu = `INSERT INTO Precio_Concentrado(idConcentrado,precio,fecha) values ((SELECT idConcentrado FROM Concentrado where nombre = 'Cu'),${bod.precioConCu},'${fechaSQL}')`
                        connection.query(sqlPrecioCu, (error, rows) =>{
                            if (error){
                                response.send(error)
                            }
                        })
                    }
                return response.status(201).json({
                        message: `Reporte creado con exito`
                })
            }else{
                return response.status(406).json({
                    message: `Reporte ya existente`
                })
            }
        })
    }catch (error){
        return response.status(500).json({
            message: `Error del servidor`
        })
    }
}
module.exports.Acumulado = (request,response) =>{
    var concentradoZn = 0
    var concentradoCu = 0
    var concentradoZnHoy = 0
    var concentradoCuHoy = 0
    var sqlZnHoy = `SELECT precio, fecha, nombre FROM Precio_Concentrado NATURAL JOIN Concentrado WHERE fecha <= '${request.params.fecha} 23:59:59' AND fecha >= '${request.params.fecha} 00:00:00' AND nombre = 'Zn' ORDER BY fecha DESC LIMIT 1; `
    var sqlCuHoy = `SELECT precio, fecha, nombre FROM Precio_Concentrado NATURAL JOIN Concentrado WHERE fecha <= '${request.params.fecha} 23:59:59' AND fecha >= '${request.params.fecha} 00:00:00' AND nombre = 'Cu' ORDER BY fecha DESC LIMIT 1; `
    var sqlZn = `SELECT SUM(precio) AS total_precios_Zn FROM Precio_Concentrado NATURAL JOIN Concentrado WHERE fecha <= DATE_ADD('${request.params.fecha}' , INTERVAL 1 DAY) and fecha >= DATE_FORMAT('${request.params.fecha}', '%Y-%m-01')  and Concentrado.nombre = 'Zn';`
    var sqlCu = `SELECT SUM(precio) AS total_precios_Cu FROM Precio_Concentrado NATURAL JOIN Concentrado WHERE fecha <= DATE_ADD('${request.params.fecha}' , INTERVAL 1 DAY) and fecha >= DATE_FORMAT('${request.params.fecha}', '%Y-%m-01') and Concentrado.nombre = 'Cu';`
    
    connection.query(sqlZn, (error, rows) => {
        if (error) {
            response.send(error);
        } else {
            concentradoZn = rows[0].total_precios_Zn;
            connection.query(sqlCu, (error, rows) => {
                if (error) {
                    response.send(error);
                } else {
                    concentradoCu = rows[0].total_precios_Cu;
                    connection.query(sqlZnHoy, (error, rows) => {
                        if (error) {
                            response.send(error);
                        } else {
                            concentradoZnHoy = rows[0].precio
                            connection.query(sqlCuHoy, (error, rows) => {
                                if (error) {
                                    response.send(error);
                                } else {
                                    concentradoCuHoy = rows[0].precio
                                    let obj = {
                                        HoyZn: concentradoZnHoy,
                                        HoyCu: concentradoCuHoy,
                                        AcumuladoZn: concentradoZn,
                                        AcumuladoCu: concentradoCu
                                    }
                                    return response.status(200).json(obj)

                                }
                            });
                        }
                    });

                }
            });
        }
    });  

}

module.exports.EditPrecios = (request, response) =>{
    var bod = request.body
    let now = new Date()
    let fechaSQL = now.toISOString().slice(0, 19).replace('T', ' ');

    var sql = `INSERT INTO Precio_Elemento(idElemento,precio,fecha) values((SELECT idElemento FROM Elemento where nombre = '${bod.elemento}'),${bod.precio}, '${fechaSQL}')`

    connection.query(sql, (error, rows) =>{
        if (error){
            response.send(error)
        }else{
            return response.status(200).json({
                message: `Actualizado`})
        }
    })

}

module.exports.ValoresElemAct = (request,response) => {
    var sql = `SELECT idElemento,nombre FROM Elemento`
    connection.query(sql, async (error, rows) =>{
        if (error){
            response.send(error)
        }else{
            let ids = []
            let nombres = []
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].idElemento)
                nombres.push(rows[i].nombre)
            }
            
            const objetoFinal = {};
            for (let j = 1; j <= ids.length; j++) {
                var sql2 = `SELECT nombre,precio from Precio_Elemento natural Join Elemento where idElemento = ${j} ORDER BY fecha DESC LIMIT 2;`
                const rows = await new Promise((resolve, reject) => {
                    connection.query(sql2, (error, rows) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve(rows);
                      }
                    });
                });
               if (rows[0] == undefined || rows[1] == undefined) {
                    objetoFinal[`${nombres[j]}`] = {
                        valorActual: 0,
                        valorAnterior:0
                    };
               }else{
                    objetoFinal[`${rows[0].nombre}`] = {
                        valorActual: rows[0].precio,
                        valorAnterior:rows[1].precio
                    };
               }
                
                
            }
            return response.status(200).json(objetoFinal)
        }
    })
}

module.exports.ValoresElemHist = (request,response) => {
    var sql = `SELECT idElemento FROM Elemento`
    connection.query(sql, async (error, rows) =>{
        if (error){
            response.send(error)
        }else{
            let ids = []
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].idElemento)
            }
            
            const objetoFinal = {};
            for (let j = 1; j <= ids.length; j++) {
                var sql2 = `SELECT nombre,precio from Precio_Elemento natural Join Elemento where idElemento = ${j} and fecha fecha <= '${request.params.fecha} 23:59:59' ORDER BY fecha DESC LIMIT 1;`
                const rows = await new Promise((resolve, reject) => {
                    connection.query(sql2, (error, rows) => {
                      if (error) {
                        reject(error);
                      } else {
                        resolve(rows);
                      }
                    });
                });
                console.log(rows);
                objetoFinal[`${rows[0].nombre}`] = rows[0].precio;
                
            }
            return response.status(200).json(objetoFinal)
        }
    })
}

module.exports.SumaElementos = async (request, response) => {
    try {
      let idsC = [];
      let nombresC = [];
      let idsE = [];
      let nombresE = [];
      
      const sql = `SELECT idConcentrado, nombre FROM Concentrado`;
      
      const rows = await new Promise((resolve, reject) => {
        connection.query(sql, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows);
          }
        });
      });
      
      for (let i = 0; i < rows.length; i++) {
        idsC.push(rows[i].idConcentrado);
        nombresC.push(rows[i].nombre);
      }
      const sql2 = `SELECT idElemento, nombre FROM Elemento`;
      const rows2 = await new Promise((resolve, reject) => {
        connection.query(sql2, (error, rows) => {
          if (error) {
            reject(error);
          } else {
            resolve(rows);
          }
        });
      });

      for (let j = 0; j < rows2.length; j++) {
        idsE.push(rows2[j].idElemento);
        nombresE.push(rows2[j].nombre);
      }
      const objetoFinal = {};
      for (let x = 0; x < idsC.length; x++) {
        for (let y = 0; y < idsE.length; y++) {
            var sql3 = `SELECT sum(gtonR) as suma from REPORTE where idConcentrado = ${idsC[x]} and idElemento = ${idsE[y]}`
            const rows3 = await new Promise((resolve, reject) => {
                connection.query(sql3, (error, rows) => {
                  if (error) {
                    reject(error);
                  } else {
                    console.log(nombresC[x])
                    console.log(nombresE[y])
                    console.log(rows[0].suma)
                    resolve(rows);
                  }
                });
            });

        }
      }


      
      console.log(nombresC);
      console.log(idsC);
      console.log(nombresE);
      console.log(idsE);
      // Resto de tu código...
      
    } catch (error) {
      response.send(error);
    }
  };
  
