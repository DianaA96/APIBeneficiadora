const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected gerente'); 
});

/*module.exports.movMineral = (request, response) => {
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
        var combinedRows = [];
  
        for (let i = 0; i < rows1.length; i++) {
          var mina = rows1[i].nombre;
          var acarreoTotal = rows1[i]['Acarreo total'];
          var trituradasTotal = rows2[i]['Trituradas total'];
          var existenciaPatios = acarreoTotal - trituradasTotal;
          var existenciaInicial = existenciaPatios + acarreoTotal;
  
          combinedRows[i] = {
            nombre: mina,
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
                // CREA UN NUEVO OBJETO PARA LA MINA
                result[mina] = {};
            }

            // VERIFICA SI EL CONCENTRADO EXISTE EN EL OBJETO DE LA MINA
            if (!result[mina].hasOwnProperty(concentrado)) {
                // AGREGA UNA NUEVA PROPIEDAD PARA EL CONCENTRADO
                result[mina][concentrado] = 0;
            }

            // SUMA EL TOTAL AL VALOR EXISTENTE
            result[mina][concentrado] += total;
        });

        // RESPUESTA
        res.send(result);
    });
};

// FILTRO DE AÑO Y MINA
// CAMBIAR ID POR NOMBRE 
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
                                    JOIN mina USING(idMina)
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


/// CORREGIR FORMATO COMO EL DE VERO VERO
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
  
        if (!combinedRows.hasOwnProperty(concentrado)) {
          combinedRows[concentrado] = {
            tms: tms,
            elementos: []
          };
        }
  
        combinedRows[concentrado].elementos.push({
          elemento: elemento,
          analisis: cantidad
        });
      }

      console.log(concentradoQuery)
  
      // ENVÍO DE RESPUESTA HTTP
      res.json(combinedRows);
    });
  };

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
  
        if (!combinedRows.hasOwnProperty(concentrado)) {
          combinedRows[concentrado] = {
            tms: tms,
            elementos: []
          };
        }
  
        combinedRows[concentrado].elementos.push({
          elemento: elemento,
          analisis: cantidad
        });
      }

      console.log(concentradoQuery)
  
      // ENVÍO DE RESPUESTA HTTP
      res.json(combinedRows);
    });
  };*/
  
  module.exports.balance = (request, response) => {
    var sql = `SELECT 
                CONCENTRADO.nombre AS concentrado, 
                ELEMENTO.nombre AS elemento, 
                MAX(gtonR),
                MAX(tms)
              FROM 
                elemento JOIN reporte USING(idElemento)
                JOIN concentrado USING(idConcentrado)
              WHERE 
                fecha = '${request.query.fecha}'
              GROUP BY 
                CONCENTRADO.nombre,
                ELEMENTO.nombre`

    connection.query(sql, (error, rows) => {
        if (error) { 
          response.send(error);
          return;
        }

        // OBJETO DE RESULTADO
        const result = {};
        let tms = 0;

        rows.forEach(row => {
            const concentrado = row.concentrado;
            const elemento = row.elemento;
            const total = row.gtonR;
            tms = row.tms;

            // VERIFICA SI LA MINA EXISTE EN EL OBJETO
            if (!result.hasOwnProperty(concentrado)) {
                // CREA UN NUEVO OBJETO PARA LA MINA
                result[concentrado] = {};
            }

            // VERIFICA SI EL CONCENTRADO EXISTE EN EL OBJETO DE LA MINA
            if (!result[concentrado].hasOwnProperty(elemento)) {
                // AGREGA UNA NUEVA PROPIEDAD PARA EL CONCENTRADO
                result[concentrado][elemento] = 0;
            }

            // SUMA EL TOTAL AL VALOR EXISTENTE
            result[concentrado][elemento] += total;
        });

        result.tms = tms;

        // RESPUESTA
        response.send(result);
      });
};


// CORREGIR
module.exports.movMineral = (request, response) => {
  var query = `SELECT 
                  MINA.nombre,
                  SUM(acarreo) AS 'acarreo',
                  SUM(trituradasP1) AS 'trituradas1',
                  SUM(trituradasP2) AS 'trituradas2'
                FROM 
                  mina 
                  JOIN movimiento_mineral USING(idMina)
                WHERE 
                  MOVIMIENTO_MINERAL.fecha = '${request.query.fecha}'
                GROUP BY 
                  idMina`;

  connection.query(query, (error, rows) => {
    if (error) {
      response.send(error);
      return;
    }

    var combinedRows = [];

    for (let i = 0; i < rows.length; i++) {
      var mina = rows[i].nombre;
      var acarreoTotal = rows[i]['acarreo'];
      var trituradasTotal = rows[i]['trituradas'];
      var existenciaPatios = acarreoTotal - trituradasTotal;
      var existenciaInicial = existenciaPatios + acarreoTotal;

      combinedRows[i] = {
        nombre: mina,
        acarreo: acarreoTotal,
        trituradas: trituradasTotal,
        existenciaPatios: existenciaPatios,
        existenciaInicial: existenciaInicial,
      };
    }

    // ENVÍO DE RESPUESTA HTTP
    response.json(combinedRows);
  });
};

module.exports.embarque = (request, response) => {
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

    var combinedRows = {};

    for (let i = 0; i < rows.length; i++) {
      var mina = rows[i].mina;
      var concentrado = rows[i].concentrado;
      var total = rows[i].total;

      if (!combinedRows.hasOwnProperty(mina)) {
        combinedRows[mina] = {};
      }

      combinedRows[mina][concentrado] = total;
    }

    // ENVÍO DE RESPUESTA HTTP
    var result = [];
    for (var mina in combinedRows) {
      var obj = { mina: mina };
      obj = { ...obj, ...combinedRows[mina] };
      result.push(obj);
    }

    response.json(result);
  });
};

module.exports.grapHistoricas = (request, response) => {
  // CONSULTA PARA ACARRADAS Y TRITURADAS
  var query = `SELECT 
                MINA.nombre,
                MONTH(fecha) AS mes,
                SUM(acarreo),
                SUM(trituradasP1) AS 'trituradas1',
                SUM(trituradasP2) AS 'trituradas2'
              FROM mina 
                JOIN movimiento_mineral USING(idMina)
              WHERE
                fecha IS NOT NULL
              GROUP BY
                MONTH(fecha),
                MINA.nombre`;

  connection.query(query, (error, rows1) => {
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
                            JOIN mina USING(idMina)
                        WHERE
                            FECHA IS NOT NULL
                        GROUP BY 
                            MONTH(fecha),
                            EMBARQUE.idConcentrado`;

    connection.query(concentrados, (error, rows2) => {
      if (error) {
          response.send(error);
          return;
      }

      // OBJETO QUE SE RETORNA
      var combinedRows = {
        acarreo: rows1,
        concentrados: rows2
      };

      // ENVÍO DE RESPUESTA HTTP
      response.json(combinedRows);
    });
  });
};
