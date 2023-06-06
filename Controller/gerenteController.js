const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected gerente'); 
});



module.exports.reporteBascula = (req, res) => {
  const fecha = req.query.fecha.replace(/'/g, '');
  const nombreMina = req.query.nombreMina.replace(/'/g, '');
  console.log(fecha)
  console.log(nombreMina)

  const consulta1 = `select 
  sum(acarreo-(trituradasP1+trituradasP2)) as inicial,
  sum(trituradasP1+trituradasP2) as molidasAcum
  from movimiento_mineral mv
  join mina m on m.idMina=mv.idMina
  where m.nombre='${nombreMina}' and
  '${fecha}'<= fecha and
  month(fecha) = month('${fecha}') and
  year(fecha) = year('${fecha}');`;

  const consulta2 = `SELECT 
    SUM(acarreo) AS mensual
    FROM movimiento_mineral mv
    JOIN mina m ON m.idMina = mv.idMina
    WHERE m.nombre = '${nombreMina}' AND MONTH(fecha) = MONTH('${fecha}')`;

  const consulta3 = `SELECT 
    SUM(acarreo) AS acarreoHoy,
    (trituradasP1 + trituradasP2) AS trituradasHoy
    FROM movimiento_mineral mv
    JOIN mina m ON m.idMina = mv.idMina
    WHERE m.nombre = '${nombreMina}' AND DATE(fecha) = '${fecha}'`;

  const resultado = {};

  connection.query(consulta1, (error, results1) => {
    if (error) {
      console.error('Error en la consulta 1:', error);
      resultado.inicial = { error: 'Ocurrió un error en la consulta 1' };
    } else {
      resultado.inicial = results1[0];
    }

    connection.query(consulta2, (error, results2) => {
      if (error) {
        console.error('Error en la consulta 2:', error);
        resultado.mensual = { error: 'Ocurrió un error en la consulta 2' };
      } else {
        resultado.mensual = results2[0];
      }

      connection.query(consulta3, (error, results3) => {
        if (error) {
          console.error('Error en la consulta 3:', error);
          resultado.hoy = { error: 'Ocurrió un error en la consulta 3' };
        } else {
          resultado.hoy = results3[0];
        }

        res.json(resultado);
      });
    });
  });
};



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
                gtonR,
                tms
              FROM 
                elemento JOIN reporte USING(idElemento)
                JOIN concentrado USING(idConcentrado)
              WHERE 
                fecha = '${request.query.fecha}' AND
                (CONCENTRADO.nombre = 'Pb' OR
                CONCENTRADO.nombre = 'Zn' OR 
                CONCENTRADO.nombre = 'Cabeza' OR
                CONCENTRADO.nombre = 'Colas') AND
                idMina = '${request.query.idMina}'`

  connection.query(sql, (error, rows) => {
    if (error) {
      response.send(error);
    }

    const result = {};

    rows.forEach(row => {
      const concentrado = row.concentrado;
      const elemento = row.elemento;
      const total = row.gtonR;
      const tms = row.tms;

      // VERIFICA SI CONCENTRADO EXISTE
      if (!result.hasOwnProperty(concentrado)) {
        // OBJETO PARA CONCENTRADO
        result[concentrado] = {
          tms: tms
        };
      }

      // VERIFICA SI CONCENTRADO EXISTE
      if (!result[concentrado].hasOwnProperty(elemento)) {
        // ELEMENTO PARA ELEMENTO
        result[concentrado][elemento] = total;
      }
    });

    response.json(result);
  });
};

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
      var trituradasTotal = rows[i]['trituradas1'] + rows[i]['trituradas2'];
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


/*
en orden de minas
  trituradas [
    1 [45, 67, 43],
    2
    3
  ]
  acarreo [
    2 [45, 67, 43],
    4
    5
  ]
  en orden de ...
  [
    1 [45, 67, 43],
    2 [45, 456, 564]
    3....
  ]*/

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

    const trituradas = [];
    const acarreo = [];

    rows1.forEach(row => {
      const mes = row.mes;
      const trituradasValue = row.trituradas1 + row.trituradas2;
      const acarreoValue = row.acarreo;

      if (!trituradas.hasOwnProperty(mes)) {
        trituradas[mes] = [];
      }

      if (!acarreo.hasOwnProperty(mes)) {
        acarreo[mes] = [];
      }

      trituradas[mes].push(trituradasValue);
      acarreo[mes].push(acarreoValue);
    });

    const result1 = {
      trituradas: trituradas,
      acarreo: acarreo
    };

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

      const result = [];

      rows2.forEach(row => {
        const mes = row.mes;
        const total = row.totalConcentrados;

        if (!result.hasOwnProperty(mes)) {
          result[mes] = [];
        }

        result[mes].push(total);
      });

      // OBJETO QUE SE RETORNA
      var combinedRows = {
        acarreo: result1,
        concentrados: result
      };

      // ENVÍO DE RESPUESTA HTTP
      response.json(combinedRows);

      });
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

  connection.query(query, (error, rows) => {
    if (error) {
      response.send(error);
    }

    const trituradas = {};
    const acarreo = {};

    rows.forEach(row => {
      const mes = row.mes;
      const trituradasValue = row.trituradas1 + row.trituradas2;
      const acarreoValue = row.acarreo;

      if (!trituradas.hasOwnProperty(mes)) {
        trituradas[mes] = [];
      }

      if (!acarreo.hasOwnProperty(mes)) {
        acarreo[mes] = [];
      }

      trituradas[mes].push(trituradasValue);
      acarreo[mes].push(acarreoValue);
    });

    const result = {
      trituradas: trituradas,
      acarreo: acarreo
    };

    response.json(result);
  });
};



