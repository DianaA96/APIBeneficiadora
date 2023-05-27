const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected gerente'); 
});

module.exports.movMineral = (request, response) => {
    // CONSULTA PARA ACARRADAS
    var acarreo = `SELECT 
                    nombre,
                    SUM(acarreo) AS 'Acarreo total'
                  FROM mina 
                    JOIN acarreo USING(idMina)
                    JOIN movimiento_mineral USING(idMovimiento)
                  WHERE 
                    MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                  GROUP BY (idMina)`;
  
    connection.query(acarreo, (error, rows1) => {
      if (error) {
        response.send(error);
        return;
      }
  
      // CONSULTA PARA TRITURADAS
      var trituradas = `SELECT 
                          nombre,
                          SUM(trituradas) AS 'Trituradas total'
                      FROM mina 
                          JOIN trituradas USING(idMina)
                          JOIN movimiento_mineral USING(idMovimiento)
                      WHERE MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                      GROUP BY (idMina)`;
  
      connection.query(trituradas, (error, rows2) => {
        if (error) {
          response.send(error);
          return;
        }
  
        // OBJETO POR MINA
        var combinedRows = {};
  
        for (let i = 0; i < rows1.length; i++) {
          var mina = rows1[i].nombre;
          var acarreoTotal = rows1[i]['Acarreo total'];
          var trituradasTotal = rows2[i]['Trituradas total'];
          var existenciaPatios = acarreoTotal - trituradasTotal;
          var existenciaInicial = existenciaPatios + acarreoTotal;
  
          combinedRows[mina] = {
            acarreo: acarreoTotal,
            trituradas: trituradasTotal,
            existenciaPatios: existenciaPatios,
            existenciaInicial: existenciaInicial,
          };
        }
  
        // ENVÍO DE RESPUESTA HTTP
        response.json(combinedRows);
      });
    });
  };  

  /*
module.exports.embarque = (request, res) => {
    const query =   `SELECT 
                        MINA.nombre AS mina, 
                        CONCENTRADO.nombre as concentrado, 
                        SUM(embarque) AS total
                    FROM 
                        mina 
                        JOIN embarque USING(idMina)
                        JOIN concentrado USING(idConcentrado)
                    WHERE
                        EMBARQUE.fecha = '${request.query.fecha}'
                    GROUP BY 
                        MINA.idMina,
                        CONCENTRADO.idConcentrado`

    connection.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
};*/

module.exports.embarque = (request, res) => {
    const query = `SELECT 
                        MINA.nombre AS mina, 
                        CONCENTRADO.nombre as concentrado, 
                        SUM(embarque) AS total
                    FROM 
                        mina 
                        JOIN embarque USING(idMina)
                        JOIN concentrado USING(idConcentrado)
                    WHERE
                        EMBARQUE.fecha = '${request.query.fecha}'
                    GROUP BY 
                        MINA.idMina,
                        CONCENTRADO.idConcentrado`

    connection.query(query, (err, rows) => {
        if (err) {
            throw err;
        }
        
        // OBJETO DE RESULTADO
        const result = {};

        rows.forEach(row => {
            const mina = row.mina;
            const concentrado = row.concentrado;
            const total = row.total;
            
            // VERIFICA SI LA MINA EXISTE EN EL OBJETO
            if (!result.hasOwnProperty(mina)) {
                // CREA ARREGLO VACÍO
                result[mina] = [];
            }
            
            // CREA OBJETO
            const concentradoObj = {
                nombre: concentrado,
                total: total
            };
            
            // AGREGA OBJETO AL ARREGLO
            result[mina].push(concentradoObj);
        });

        // RESPUESTA
        res.send(result);
    });
};


module.exports.grapHistoricas = (request, response) =>{
    // CONSULTA PARA ACARRADAS
    var acarreo =   `SELECT 
                        idMina,
                        MONTH(fecha) AS mes, 
                        SUM(acarreo) AS totalAcarreo
                    FROM 
                        acarreo
                    WHERE 
                        fecha IS NOT NULL
                    GROUP BY 
                        MONTH(fecha),
                        idMina`;

    connection.query(acarreo, (error, rows1) => {
        if (error) {
            response.send(error);
            return;
        }

        // CONSULTA PARA TRITURADAS
        var trituradas =   `SELECT 
                                idMina,
                                MONTH(fecha) AS mes, 
                                SUM(trituradas) AS totalTrituradas
                            FROM 
                                trituradas
                            WHERE 
                                fecha IS NOT NULL
                            GROUP BY 
                                MONTH(fecha),
                                idMina`;

        connection.query(trituradas, (error, rows2) => {
            if (error) {
                response.send(error);
                return;
            }

            // CONSULTA PARA CONCENTRADOS
            var concentrados =  `SELECT 
                                    MONTH(fecha) AS mes, 
                                    SUM(embarque) AS totalConcentrados,
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

/*
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
}; */

module.exports.balance = (request, res) => {
    const concentradoQuery = `SELECT 
                                idElemento, 
                                idConcentrado, 
                                ELEMENTO.nombre AS elemento,
                                CONCENTRADO.nombre AS concentrado,
                                SUM(gton) AS cantidad, 
                                tms
                              FROM 
                                analisis
                                JOIN laboratorio USING(idAnalisis)
                                JOIN elemento USING(idElemento)
                                JOIN concentrado USING(idConcentrado)
                              WHERE 
                                idAnalisis = 1 
                                AND idConcentrado = 5
                              GROUP BY 
                                idElemento, 
                                idConcentrado`;
  
    connection.query(concentradoQuery, (error, rows1) => {
      if (error) {
        res.send(error);
        return;
      }
  
      // OBJETO POR CONCENTRADO
      const combinedRows = {};
  
      for (let i = 0; i < rows1.length; i++) {
        const concentrado = rows1[i].concentrado;
        const elemento = rows1[i].elemento;
        const cantidad = rows1[i].cantidad;
        const tms = rows1[i].tms;
        const contenido = (tms * cantidad) / 100;
        const recuperacion = contenido * 100;
  
        if (!combinedRows.hasOwnProperty(concentrado)) {
          combinedRows[concentrado] = {
            tms: tms,
            elementos: [],
          };
        }
  
        combinedRows[concentrado].elementos.push({
          elemento: elemento,
          analisis: cantidad,
          contenido: contenido,
          recuperacion: recuperacion
        });
      }
  
      // ENVÍO DE RESPUESTA HTTP
      res.json(combinedRows);
    });
  };
  
  