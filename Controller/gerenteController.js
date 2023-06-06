const { response, request } = require('express');
const mysql = require ('mysql');
const config = require('../helpers/config')

const connection = mysql.createConnection(config);
connection.connect(error => {
    if (error) throw error;
    console.log('Conected gerente'); 
});

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



