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
        var x = 0;
        for (const turno of turnos) {
            x++;
            for (let i = 0; i < Object.keys(bod[turno]).length; i++) {
                let concentrado = Object.keys(bod[turno])[i];
                for (let j = 0; j < Object.keys(bod[turno][concentrado]).length; j++) {
                    let elemento = Object.keys(bod[turno][concentrado])[j];
                    let porcentaje = bod[turno][concentrado][elemento];
                    var sqlIdC = `
                    INSERT INTO LABORATORIO (idusuario,idMina,idPlanta,fechaMuestreo,fechaEnsaye,idLab,idConcentrado,idElemento,gtonL,turno)
                    VALUES (?,?,?,?,?,?,
                           (SELECT idConcentrado FROM Concentrado WHERE nombre LIKE ?),
                           (SELECT idElemento FROM Elemento WHERE nombre LIKE ?),
                           ?,?)`;

                    await new Promise((resolve, reject) => {
                        connection.query(
                            sqlIdC,
                            [
                                request.body.idusuario,
                                request.body.idMina,
                                request.body.idPlanta,
                                request.body.fechaMuestreo,
                                request.body.fechaEnsaye,
                                request.body.idLab,
                                concentrado,
                                elemento,
                                porcentaje,
                                x
                            ],
                            (error, rows) => {
                                if (error) {
                                    console.error('An error occurred:', error);
                                    reject(error);
                                } else {
                                    resolve();
                                }
                            }
                        );
                    });
                }
            }
        }
        response.send('Reporte generado');
    } catch (error) {
        console.error('An error occurred:', error);
        return response.status(500).json({
            type: 'Error en el servidor',
            message: error
        });
    }
};


//Muestra el reporte de laboratorio segun la fecha enviada
module.exports.LabTable = async (req, response) => {
    try {
        const query = `
        SELECT
            LABORATORIO.IdLaboratorio AS id,
            LABORATORIO.IdLab AS idLab,
            Concentrado.nombre AS nombre_concentrado,
            Elemento.nombre AS nombre_elemento,
            gtonL AS gton,
            Mina.nombre AS nombre_mina,
            Planta.nombre AS nombre_planta,
            LABORATORIO.turno AS turno
        FROM
            LABORATORIO
            INNER JOIN Concentrado ON LABORATORIO.idConcentrado = Concentrado.idConcentrado
            INNER JOIN Elemento ON LABORATORIO.idElemento = Elemento.idElemento
            INNER JOIN Planta ON LABORATORIO.idPlanta = Planta.idPlanta
            INNER JOIN Mina ON LABORATORIO.idMina = Mina.idMina
        WHERE
            Mina.nombre LIKE '${req.query.mina}' AND
            Planta.nombre LIKE '${req.query.planta}' AND
            LABORATORIO.fechaEnsaye LIKE '${req.query.fecha}'
        ORDER BY
            LABORATORIO.idLaboratorio ASC;`;

        await new Promise((resolve, reject) => {
            connection.query(query, (err, result) => {
                if (err) {
                    console.error('Error:', err);
                    reject(err);
                } else {
                    if (result.length == 0) {
                        resolve(response.send({ message: 'No hay resultados' }));
                    } else {
                        let head, report = {};

                        head = {
                            fecha: req.query.fecha,
                            planta: req.query.planta,
                            mina: req.query.mina,
                        };

                        result.forEach(element => {
                            if (element.nombre_concentrado) {
                                if (report[element.turno]) {
                                    if (report[element.turno][element.nombre_concentrado]) {
                                        report[element.turno][element.nombre_concentrado][element.nombre_elemento] = element.gton;
                                    } else {
                                        report[element.turno][element.nombre_concentrado] = {};
                                        report[element.turno][element.nombre_concentrado][element.nombre_elemento] = element.gton;
                                    }
                                } else {
                                    report[element.turno] = {};
                                    report[element.turno][element.nombre_concentrado] = {};
                                    report[element.turno][element.nombre_concentrado][element.nombre_elemento] = element.gton;
                                }
                            }
                        });
                        resolve(response.send({ head, report }));
                    }
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
        const query = `
        SELECT
            l.fechaEnsaye,
            l.fechaMuestreo,
            l.idLab AS id,
            m.nombre AS nombreMina
        FROM
            LABORATORIO l
        JOIN
            MINA m ON l.idMina = m.idMina
        GROUP BY
            l.fechaEnsaye,
            l.fechaMuestreo,
            l.idLab,
            m.nombre
        ORDER BY
            l.fechaEnsaye DESC;`;

        await new Promise((resolve, reject) => {
            connection.query(query, (err, result) => {
                if (err) {
                    console.error('An error occurred:', err);
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