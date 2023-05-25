const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected gerente'); 
});

module.exports.movMineral = (request, response) =>{
    // CONSULTA PARA ACARRADAS
    var acarreo =   `SELECT 
                        nombre,
                        SUM(acarreo) AS 'Acarreo total'
                    FROM mina 
                        JOIN acarreo USING(idMina)
                        JOIN movimiento_mineral USING(idMovimiento)
                    WHERE MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                    GROUP BY (nombre)`;

    connection.query(acarreo, (error, rows1) => {
        if (error) {
            response.send(error);
            return;
        }

        // CONSULTA PARA TRITURADAS
        var trituradas =    `SELECT 
                                nombre,
                                SUM(trituradas) AS 'Trituradas total'
                            FROM mina 
                                JOIN trituradas USING(idMina)
                                JOIN movimiento_mineral USING(idMovimiento)
                            WHERE MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                            GROUP BY (nombre)`

        connection.query(trituradas, (error, rows2) => {
            if (error) {
                response.send(error);
                return;
            }

            // CALCULOS
            var existenciaPatios = rows1[0]['Acarreo total'] - rows2[0]['Trituradas total'];
            var existenciaInicial = existenciaPatios + rows1[0]['Acarreo total'];

            // OBJETO QUE SE RETORNA
            var combinedRows = {
                acarreo: rows1,
                trituradas: rows2,
                existenciaPatios: existenciaPatios,
                existenciaInicial: existenciaInicial
            };

            // ENVÍO DE RESPUESTA HTTP
            response.json(combinedRows);
        });
    });
};

/*
module.exports.embarque = (request, res) => {
    const query =   `SELECT 
                        MINA.nombre, 
                        CONCENTRADO.nombre, 
                        SUM(concentrado)
                    FROM 
                        mina 
                        JOIN embarque USING(idMina)
                        JOIN concentrado USING(idConcentrado)
                    WHERE
                        EMBARQUE.fecha = '${request.query.fecha}'
                    GROUP BY 
                        EMBARQUE.idConcentrado`;

    connection.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
};*/

module.exports.grapHistoricas = (request, response) =>{
    // CONSULTA PARA ACARRADAS
    var acarreo =   `SELECT 
                        MONTH(fecha) AS mes, 
                        SUM(acarreo) AS totalAcarreo
                    FROM 
                        acarreo
                    WHERE 
                        fecha IS NOT NULL
                    GROUP BY 
                        MONTH(fecha)`;

    connection.query(acarreo, (error, rows1) => {
        if (error) {
            response.send(error);
            return;
        }

        // CONSULTA PARA TRITURADAS
        var trituradas =   `SELECT 
                                MONTH(fecha) AS mes, 
                                SUM(trituradas) AS totalTrituradas
                            FROM 
                                trituradas
                            WHERE 
                                fecha IS NOT NULL
                            GROUP BY 
                                MONTH(fecha)`;

        connection.query(trituradas, (error, rows2) => {
            if (error) {
                response.send(error);
                return;
            }

            // CONSULTA PARA CONCENTRADOS
            var concentrados =  `SELECT 
                                    MONTH(fecha) AS mes, 
                                    SUM(concentrado) AS totalConcentrados,
                                    CONCENTRADO.nombre
                                FROM 
                                    embarque
                                    JOIN concentrado USING(idConcentrado)
                                WHERE
                                    FECHA IS NOT NULL
                                GROUP BY 
                                    MONTH(fecha),
                                    EMBARQUE.idConcentrado`;

            connection.query(concentrados, (error, rows3) => {
                if (error) {
                    response.send(error);
                    return;
                }
    
                // OBJETO QUE SE RETORNA
                var combinedRows = {
                    acarreo: rows1,
                    trituradas: rows2,
                    concentrados: rows3
                };
    
                // ENVÍO DE RESPUESTA HTTP
                response.json(combinedRows);
            });
        });
    });
};

module.exports.historialBascula = (request, response) =>{
    // CONSULTA PARA ACARRADAS
    var acarreo =   `SELECT 
                        nombre,
                        SUM(acarreo) AS 'Acarreo total'
                    FROM mina 
                        JOIN acarreo USING(idMina)
                        JOIN movimiento_mineral USING(idMovimiento)
                    WHERE MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                    GROUP BY (nombre)`;

    connection.query(acarreo, (error, rows1) => {
        if (error) {
            response.send(error);
            return;
        }

        // CONSULTA PARA TRITURADAS
        var trituradas =    `SELECT 
                                nombre,
                                SUM(trituradas) AS 'Trituradas total'
                            FROM mina 
                                JOIN trituradas USING(idMina)
                                JOIN movimiento_mineral USING(idMovimiento)
                            WHERE MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                            GROUP BY (nombre)`

        connection.query(trituradas, (error, rows2) => {
            if (error) {
                response.send(error);
                return;
            }

            // CALCULOS
            var existenciaPatios = rows1[0]['Acarreo total'] - rows2[0]['Trituradas total'];
            var existenciaInicial = existenciaPatios + rows1[0]['Acarreo total'];

            // OBJETO QUE SE RETORNA
            var combinedRows = {
                acarreo: rows1,
                trituradas: rows2,
                existenciaPatios: existenciaPatios,
                existenciaInicial: existenciaInicial
            };

            // ENVÍO DE RESPUESTA HTTP
            response.json(combinedRows);
        });
    });
};
