const { response, request } = require('express');
const mysql = require('mysql');
const config = require('../helpers/config');
const e = require('express');
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
    } catch (e) {
        console.log(e);
    }
};

//Muestra el reporte de laboratorio segun la fecha enviada
module.exports.LabTable = async (req, res) => {
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
        await new Promise((resolve, reject) => {
            connection.query(query, (err, result) => {
                if (err) {
                    console.error('An error occurred:', err);
                    reject(err);
                } else {
                    resolve(res.send(result));
                }
            });
        });
    } catch (e) {
        console.error(e);
    };
}