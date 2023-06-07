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
  sum(trituradasP1+trituradasP2) as molidasAcum, r.humedad
  from movimiento_mineral mv
  join mina m on m.idMina=mv.idMina
  join reporte r on mv.idMina=r.idMina
  join reporte re on mv.fecha=re.fecha
  where m.nombre='${nombreMina}' and
  '${fecha}'<= mv.fecha and
  month(mv.fecha) = month('${fecha}') and
  year(mv.fecha) = year('${fecha}')`;

  const consulta2 = `SELECT 
    SUM(acarreo) AS mensual
    FROM movimiento_mineral mv
    JOIN mina m ON m.idMina = mv.idMina
    WHERE m.nombre = '${nombreMina}' AND MONTH(fecha) = MONTH('${fecha}') and
    year(fecha) = year('${fecha}')`;

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

module.exports.grapHistoricas = (request, response) => {
  // CONSULTA PARA ACARRADAS Y TRITURADAS
  var query = `SELECT 
                MINA.nombre,
                MONTH(fecha) AS mes,
                SUM(acarreo) AS acarreo,
                SUM(trituradasP1 + trituradasP2) AS 'trituradas'
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

    const trituradas = {};
    const acarreo = {};

    rows1.forEach(row => {
      const mes = row.mes;
      const trituradasValue = row.trituradas;
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

    // CONSULTA PARA CONCENTRADOS
    var concentrados = `SELECT 
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

    const result = {};

    rows2.forEach(row => {
      const mes = row.mes;
      const total = row.totalConcentrados;

      if (!result[mes]) {
        result[mes] = [];
      }

      result[mes].push(total);
    });

    const combinedRows = {
      trituradas: trituradas,
      acarreo: acarreo,
      concentrados: result
    };

      // ENVÍO DE RESPUESTA HTTP
      response.json(combinedRows);
    });
  });
};

module.exports.movMineralTable = (request, response) => {
  const sql = `SELECT
                idMovimiento, 
                SUM(acarreo) AS acarreo,
                SUM(trituradasP1 + trituradasP2) AS trituradas,
                SUM(acarreo-(trituradasP1+trituradasP2)) as patios,
                fecha
              FROM 
                movimiento_mineral
              GROUP BY 
                fecha`;

  connection.query(sql, (error, rows) => {
    if (error) {
      response.send(error);
      return;
    }

    const combinedRows = [];

    let completedQueries = 0; // Contador para realizar un seguimiento de las consultas completadas

    for (let i = 0; i < rows.length; i++) {
      const acarreo = rows[i].acarreo;
      const trituradas = rows[i].trituradas;
      const patios = rows[i].patios;
      const id = rows[i].idMovimiento;
      const fecha = rows[i].fecha;

      const inicial = `SELECT
                        SUM(acarreo-(trituradasP1+trituradasP2)) as inicial
                      FROM 
                        movimiento_mineral
                      WHERE 
                        fecha = DATE_SUB('${fecha}', INTERVAL 1 DAY)`;

      connection.query(inicial, (error, rows2) => {
        if (error) {
          response.send(error);
          return;
        }

        const inicialValue = rows2[0].inicial + trituradas;

        combinedRows[i] = {
          id: id,
          fecha: fecha,
          acarreo: acarreo,
          trituradas: trituradas,
          patios: patios,
          inicial: inicialValue,
        };

        completedQueries++;

        // Verificar si todas las consultas se han completado
        if (completedQueries === rows.length) {
          // ENVÍO DE RESPUESTA HTTP
          response.json(combinedRows);
        }
      });
    }
  });
};


/*
module.exports.movMineralTable = (request, response) =>{
  const sql = `SELECT
                idMovimiento, 
                SUM(acarreo) AS acarreo,
                SUM(trituradasP1 + trituradasP2) AS trituradas,
                SUM(acarreo-(trituradasP1+trituradasP2)) as patios,
                fecha
              FROM 
                movimiento_mineral
              GROUP BY 
                fecha`;

  connection.query(sql, (error, rows) =>{
      if (error) 
          response.send(error)
      response.json(rows)
  })
}*/