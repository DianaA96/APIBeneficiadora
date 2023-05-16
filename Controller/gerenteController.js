const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected gerente'); 
});

module.exports.Historial = (request, response) =>{
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
                                JOIN triruradas USING(idMina)
                                JOIN movimiento_mineral USING(idMovimiento)
                            WHERE MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                            GROUP BY (nombre)`

        connection.query(trituradas, (error, rows2) => {
            if (error) {
                response.send(error);
                return;
            }

            // CALCULOS
            // Cálculo de información adicional
            var existenciaPatios = rows1[0]['Acarreo total'] - rows2[0]['Trituradas total'];
            var existenciaInicial = existenciaPatios + rows1[0]['Acarreo total'];

            // OBJETO QUE SE RETORNA
            var combinedRows = {
                acarreo: rows1,
                trituradas: rows2,
                existenciaPatios: existenciaPatios,
                existenciaInicial: existenciaInicial
            };

            // Envío de respuesta HTTP
            response.json(combinedRows);
        });
    });
};