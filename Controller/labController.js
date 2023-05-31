const { response, request } = require('express');
const mysql = require('mysql');
const config = require('../helpers/config');
const e = require('express');
const { NULL } = require('mysql/lib/protocol/constants/types');
const connection = mysql.createConnection(config, { multipleStatements: true });

connection.connect(error => {
    if (error) throw error;
    console.log('Conected Lab');
});

//Genera el reporte de laboratorio
module.exports.LabReport = async (request, response) => {
    try {
        var bod = request.body;
        const turnos = ["primerT", "segundoT", "tercerT"];
        var q = 0;
        let idAnalisis;

        for (const turno of turnos) {
            q++;
            var sql1 = `INSERT INTO Analisis(idUsuario,idMina,idPlanta,fechaMuestreo,fechaEnsaye,turno) 
                        values(${bod.idUsuario},${bod.idMina},${bod.idPlanta},'${bod.fechaMuestreo}','${bod.fechaEnsaye}',${(q).toString()});`;

            await new Promise((resolve, reject) => {//espera al insert de analisis para obtener el idAnalisis
                connection.query(sql1, (error, rows) => {
                    if (error) {
                        console.error('An error occurred:', error);
                        reject(error);
                    } else {
                        resolve(idAnalisis = rows.insertId);
                    }
                });
            });

            for (let i = 0; i < Object.keys(bod[turno]).length; i++) {//intera dependiendo de la cantidad de concentrados Cabeza,colas,etc

                let concentrado = Object.keys(bod[turno])[i];//lee el concentrado

                for (let j = 0; j < Object.keys(bod[turno][concentrado]).length; j++)//itera dependiendo de la cantidad de elementos
                {
                    let elemento = Object.keys(bod[turno][concentrado])[j];//lee el elemento
                    let porcentaje = bod[turno][concentrado][elemento];//lee el porcentaje

                    var sqlIdC = `INSERT INTO Laboratorio(idAnalisis,idConcentrado,idElemento,gton) 
                                  VALUES(${idAnalisis},(SELECT idConcentrado FROM Concentrado where nombre = '${concentrado}'),
                                  (SELECT idElemento FROM Elemento where nombre = '${elemento}'),${porcentaje})`;

                    await new Promise((resolve, reject) =>//espera a que se realize el insert de laboratorio para cada porcentaje del elemento iterado
                    {
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
    } catch (error) {
        return response.status(500).json({
            type: "Error en el servidor",
            message: error
        })
    }
};

//Muestra el reporte de laboratorio segun la fecha enviada
module.exports.LabTable = async (req, response) => {
    try {
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
                    Planta.nombre LIKE '${req.query.planta}'
                GROUP BY 
                    Laboratorio.idConcentrado, 
                    Laboratorio.idElemento, 
                    Laboratorio.gton, 
                    Analisis.idAnalisis, 
                    Analisis.turno
                ORDER BY
                    Analisis.idAnalisis
                `;

        await new Promise((resolve, reject) => {
            connection.query(query, (err, result) => {
                if (err) {
                    //console.error('An error occurred:', err);
                    reject(err);
                } else {

                    let head, report = {};//

                    head = {
                        fecha: req.query.fecha,//fecha del reporte
                        planta: req.query.planta,//nombre de la planta
                        mina: req.query.mina,//nombre de la mina
                    };

                    result.forEach(element => {//itera el resultado de la consulta
                        if (element.nombre_concentrado) {//si existe el concentrado
                            if (report[element.turno]) {//si existe el turno
                                if (report[element.turno][element.nombre_concentrado]) {//si existe el concentrado
                                    report[element.turno][element.nombre_concentrado][element.nombre_elemento] = element.gton;//agrega el elemento
                                } else {//si no existe el concentrado
                                    report[element.turno][element.nombre_concentrado] = {};//crea el concentrado
                                    report[element.turno][element.nombre_concentrado][element.nombre_elemento] = element.gton;//agrega el elemento
                                }
                            } else {//si no existe el turno
                                report[element.turno] = {};//crea el turno
                                report[element.turno][element.nombre_concentrado] = {};//crea el concentrado
                                report[element.turno][element.nombre_concentrado][element.nombre_elemento] = element.gton;//agrega el elemento
                            }
                        }
                    });

                    resolve(response.send({ head, report }));
                }
            });
        });
    } catch (error) {
        return response.status(500).json({
            type: "Error en el servidor",
            message: error,
        })
    }
};

module.exports.LabList = async (req, response) => {
    try {
        const query = `SELECT MIN(analisis.idAnalisis) AS id,
                        Mina.nombre AS nombreMina,
                        analisis.fechaEnsaye,
                        MAX(analisis.fechaMuestreo) AS fechaMuestreo
                        FROM analisis
                        INNER JOIN Mina ON Mina.idMina = analisis.idMina
                        GROUP BY analisis.fechaEnsaye, Mina.nombre;`;

        await new Promise((resolve, reject) => {
            connection.query(query, (err, result) => {
                if (err) {
                    //console.error('An error occurred:', err);
                    reject(err);
                } else {
                    result.forEach(element => {
                        if (element.fechaMuestreo != null) {
                            element.fechaMuestreo = element.fechaMuestreo.toISOString().split('T')[0];
                            element.fechaEnsaye = element.fechaEnsaye.toISOString().split('T')[0];
                        }
                    });
                    resolve(response.send(result));
                }
            });
        });
    } catch (error) {
        return response.status(500).json({
            type: "Error en el servidor",
            message: error
        })
    }
};