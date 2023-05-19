const { response, request } = require('express');
const mysql = require('mysql');
const config = require('../helpers/config');
const e = require('express');
const connection = mysql.createConnection(config, { multipleStatements: true });

connection.connect(error => {
    if (error) throw error;
    console.log('Conected Lab');
});

/* Este codigo genera los reportes y luego lo relaciona con las tablas 
module.exports.LabReport = (request, response) => {
    try {
        var bod = request.body;
        const turnos = ["primerT", "segundoT", "tercerT"];
        var q = 1;
        var times = 0;
        turnos.forEach(turno => {
            var i = q++;
            var sql1 = `
            INSERT INTO Analisis(idUsuario,idMina,idPlanta,fechaMuestreo,fechaEnsaye,turno) 
            values(${bod.idUsuario},${bod.idMina},${bod.idPlanta},'${bod.fechaMuestreo}','${bod.fechaEnsaye}',${(q - 1).toString()});`;
            connection.query(sql1, (error, rows) => {
                if (error) {
                    console.error('An error occurred:', error);
                } else {
                    times++;
                    console.log("-----------------------------times: ", times);
                    let idAnalisis = rows.insertId; //Guardas el id nuevo que es el id del reporte nuevo generado
                    //El primer for con la funcion Object Keys lee los concentrados por nombre y los convierte en id 
                    for (let i = 0; i < Object.keys(bod[turno]).length; i++) {
                        let concentrado = Object.keys(bod[turno])[i]
                        //El segundo for con la funcion Object Keys lee los elementos por nombre y los convierte en id
                        console.log("Concentrado: ", concentrado)
                        for (let j = 0; j < Object.keys(bod[turno][concentrado]).length; j++) {
                            let elemento = Object.keys(bod[turno][concentrado])[j] //Guarda el elemento que es
                            let porcentaje = bod[turno][concentrado][elemento] //Guarda el porcentaje del elemento
                            console.log(elemento, ": ", porcentaje);
                            var sqlIdC = `
                                INSERT INTO Laboratorio(idAnalisis,idConcentrado,idElemento,gton) 
                                VALUES(${idAnalisis},(SELECT idConcentrado FROM Concentrado where nombre = '${concentrado}'),
                                (SELECT idElemento FROM Elemento where nombre = '${elemento}'),${porcentaje})`;
                            connection.query(sqlIdC, (error, rows) => {
                                if (error) {
                                    // Handle the error
                                    console.error('An error occurred:', error);
                                }
                                else { 
                                    console
                                }
                            });
                        }
                    }
                }
            })
        });
    } catch (e) {
        console.log(e)
    }
};
de cada concentrado y a su vez con cada uno de los elementos */

module.exports.LabReport = async (request, response) => {
    try {
        var bod = request.body;
        const turnos = ["primerT", "segundoT", "tercerT"];
        var q = 1;
        var times = 0;
        let idAnalisis;

        for (const turno of turnos) {
            q++;
            var sql1 = `INSERT INTO Analisis(idUsuario,idMina,idPlanta,fechaMuestreo,fechaEnsaye,turno) 
        values(${bod.idUsuario},${bod.idMina},${bod.idPlanta},'${bod.fechaMuestreo}','${bod.fechaEnsaye}',${(q - 1).toString()});`;

            await new Promise((resolve, reject) => {
                connection.query(sql1, (error, rows) => {
                    if (error) {
                        console.error('An error occurred:', error);
                        reject(error);
                    } else {
                        times++;
                        idAnalisis = rows.insertId;
                        console.log("-----------------------------times: ", times);
                        resolve(idAnalisis);
                    }
                });
            });

            for (let i = 0; i < Object.keys(bod[turno]).length; i++) {
                let concentrado = Object.keys(bod[turno])[i];
                console.log(concentrado)
                for (let j = 0; j < Object.keys(bod[turno][concentrado]).length; j++) {
                    let elemento = Object.keys(bod[turno][concentrado])[j];
                    let porcentaje = bod[turno][concentrado][elemento];
                    console.log(elemento, ": ", porcentaje);
                    var sqlIdC = `INSERT INTO Laboratorio(idAnalisis,idConcentrado,idElemento,gton) 
                                  VALUES(${idAnalisis},(SELECT idConcentrado FROM Concentrado where nombre = '${concentrado}'),
                                  (SELECT idElemento FROM Elemento where nombre = '${elemento}'),${porcentaje})`;

                    await new Promise((resolve, reject) => {
                        connection.query(sqlIdC, (error, rows) => {
                            if (error) {
                                console.error('An error occurred:', error);
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            }
        }
        response.send("Reporte generado");
    } catch (e) {
        console.log(e);
    }
};


module.exports.LabTable = (req, res) => {
    const query = `SELECT 
                    Analisis.idAnalisis AS idAnalisis,
                    Concentrado.nombre AS nombre_concentrado,
                    Elemento.nombre AS nombre_elemento,
                    Laboratorio.gton AS gton,    
                    Mina.nombre AS nombre_mina,
                    Planta.nombre AS nombre_planta,
                    Analisis.turno AS turno
                FROM 
                    Laboratorio 
                    INNER JOIN Analisis ON Laboratorio.idAnalisis = Analisis.idAnalisis 
                    INNER JOIN Elemento ON Laboratorio.idElemento = Elemento.idElemento
                    INNER JOIN Concentrado ON Laboratorio.idConcentrado = Concentrado.idConcentrado
                    INNER JOIN Mina ON Analisis.idmina = Mina.idMina
                    INNER JOIN Planta ON Planta.idPlanta = Analisis.idPlanta
                WHERE 
                    Mina.nombre LIKE '${req.query.mina}' AND
                    Planta.nombre LIKE '${req.query.planta}' AND
                    Analisis.fechaEnsaye LIKE '${req.query.fecha}'

                GROUP BY 
                    Laboratorio.idConcentrado, 
                    Laboratorio.idElemento, 
                    Laboratorio.gton, 
                    Analisis.idAnalisis, 
                    Analisis.turno
                ORDER BY 
                    Analisis.idAnalisis
                `;

    connection.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
}