const { response, request } = require('express');
const mysql = require('mysql');
const config = require('../helpers/config')
const connection = mysql.createConnection(config, { multipleStatements: true });

connection.connect(error => {
  if (error) throw error;
  console.log('Conected operadorRD');
});

// Función para insertar los datos en la tabla 'acarreo'
/*const insertarAcarreo = (datosAcarreo) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO acarreo (idMovimiento, idMina, idSubmina, acarreo, fecha) VALUES ?";
    const valores = datosAcarreo.map(dato => [dato.idMovimiento, dato.idMina, dato.idSubmina, dato.acarreo, dato.fecha]);
    connection.query(sql, [valores], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Función para insertar los datos en la tabla 'trituradas'
const insertarTrituradas = (datosTrituradas) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO trituradas (idMovimiento, idMina, idSubmina, trituradas, idPlanta, fecha) VALUES ?";
    const valores = datosTrituradas.map(dato => [dato.idMovimiento, dato.idMina, dato.idSubmina, dato.trituradas, dato.idPlanta, dato.fecha]);
    connection.query(sql, [valores], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Controlador para procesar la petición POST de inserción de datos en ambas tablas
module.exports.operadorReporteD = (req, res) => {

    console.log(req.body.datos)
    //JSON.parse(JSON.stringify(userData))
    const datos = JSON.parse(JSON.stringify(req.body.datos));
    
  
    // Filtramos los datos correspondientes a la tabla 'acarreo'
    const datosAcarreo = datos.filter(dato => dato.tipo === 'acarreo');
  
    // Filtramos los datos correspondientes a la tabla 'trituradas'
    const datosTrituradas = datos.filter(dato => dato.tipo === 'trituradas');
  
    // Insertamos los datos en ambas tablas
    Promise.all([insertarAcarreo(datosAcarreo), insertarTrituradas(datosTrituradas)])
      .then(resultados => {
        res.json({ mensaje: "Datos insertados correctamente" });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ mensaje: "Error al insertar los datos" });
      });
  }*/
  


// Controlador para procesar la petición GET de consultas múltiples
/*module.exports.reporteD = (req, res) => {
  const consultas = [
    "SELECT SUM(acarreo) AS aLaFecha1_1 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN acarreo a ON s.idSubmina = a.idSubmina AND m.idMina = a.idMina WHERE a.idMina = 1 AND a.idSubmina = 1",
    "SELECT SUM(acarreo) AS aLaFecha1_2 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN acarreo a ON s.idSubmina = a.idSubmina AND m.idMina = a.idMina WHERE a.idMina = 1 AND a.idSubmina = 2",
    "SELECT SUM(acarreo) AS aLaFecha1_3 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN acarreo a ON s.idSubmina = a.idSubmina AND m.idMina = a.idMina WHERE a.idMina = 1 AND a.idSubmina = 3",
    "SELECT SUM(acarreo) AS aLaFecha2_4 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN acarreo a ON s.idSubmina = a.idSubmina AND m.idMina = a.idMina WHERE a.idMina = 2 AND a.idSubmina = 4",
    "SELECT SUM(acarreo) AS aLaFecha2_5 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN acarreo a ON s.idSubmina = a.idSubmina AND m.idMina = a.idMina WHERE a.idMina = 2 AND a.idSubmina = 5",
    "SELECT SUM(acarreo) AS aLaFecha2_6 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN acarreo a ON s.idSubmina = a.idSubmina AND m.idMina = a.idMina WHERE a.idMina = 2 AND a.idSubmina = 6",
    "SELECT SUM(acarreo) AS aLaFecha3_7 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN acarreo a ON s.idSubmina = a.idSubmina AND m.idMina = a.idMina WHERE a.idMina = 3 AND a.idSubmina = 7",
    "SELECT SUM(trituradas) AS TaLaFecha111 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 1 AND t.idSubmina = 1 AND t.idPlanta = 1",
    "SELECT SUM(trituradas) AS TaLaFecha112 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 1 AND t.idSubmina = 1 AND t.idPlanta = 2",
    "SELECT SUM(trituradas) AS TaLaFecha121 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 1 AND t.idSubmina = 2 AND t.idPlanta = 1",
    "SELECT SUM(trituradas) AS TaLaFecha122 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 1 AND t.idSubmina = 2 AND t.idPlanta = 2",
    "SELECT SUM(trituradas) AS TaLaFecha131 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 1 AND t.idSubmina = 3 AND t.idPlanta = 1",
    "SELECT SUM(trituradas) AS TaLaFecha132 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 1 AND t.idSubmina = 3 AND t.idPlanta = 2",
    "SELECT SUM(trituradas) AS TaLaFecha241 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 2 AND t.idSubmina = 4 AND t.idPlanta = 1",
    "SELECT SUM(trituradas) AS TaLaFecha242 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 2 AND t.idSubmina = 4 AND t.idPlanta = 2",
    "SELECT SUM(trituradas) AS TaLaFecha251 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 2 AND t.idSubmina = 5 AND t.idPlanta = 1",
    "SELECT SUM(trituradas) AS TaLaFecha252 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 2 AND t.idSubmina = 5 AND t.idPlanta = 2",
    "SELECT SUM(trituradas) AS TaLaFecha261 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 2 AND t.idSubmina = 6 AND t.idPlanta = 1",
    "SELECT SUM(trituradas) AS TaLaFecha262 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 2 AND t.idSubmina = 6 AND t.idPlanta = 2",
    "SELECT SUM(trituradas) AS TaLaFecha371 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 3 AND t.idSubmina = 7 AND t.idPlanta = 1",
    "SELECT SUM(trituradas) AS TaLaFecha372 FROM mina m JOIN submina s USING(idMina) JOIN mina USING(idMina) JOIN trituradas t ON s.idSubmina = t.idSubmina AND m.idMina = t.idMina WHERE t.idMina = 3 AND t.idSubmina = 7 AND t.idPlanta = 2"
  ];

  const resultados = [];

  // Ejecutar las consultas en paralelo utilizando Promises
  const consultasPromises = consultas.map(consulta => {
    return new Promise((resolve, reject) => {
      connection.query(consulta, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0]);
        }
      });
    });
  });

  // Esperar a que todas las consultas se completen
  Promise.all(consultasPromises)
    .then(results => {
      results.forEach(result => {
        resultados.push(result);
      });
      res.json(resultados);
    })
    .catch(error => {
      console.error("Error al ejecutar las consultas:", error);
      res.status(500).json({ error: "Ocurrió un error al procesar las consultas" });
    });
};*/


module.exports.reporteD =  (req, res) => {
  const consulta = `
  select m.nombre as mina,sm.nombre as submina, sum(acarreo) as acarreo, 
sum(trituradasP1) as P1, sum(trituradasP2) as P2,
sum(acarreo-(trituradasP1+trituradasP2)) as inicial
from movimiento_mineral mv join submina sm using(idMina,idSubmina)
join mina m on m.idMina=sm.idMina
group by mv.idMina,mv.idSubmina;`;

  connection.query(consulta, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Ocurrió un error al procesar la consulta' });
    } else {
      res.json(results);
    }
  });
};


/*module.exports.existenciaInicial =  (req, res) => {
  const consulta = `
  select sum(acarreo-(trituradasP1+trituradasP2)) as inicial, m.nombre as mina,sm.nombre as submina
from movimiento_mineral mv join submina sm using(idMina,idSubmina)
join mina m on m.idMina=sm.idMina
group by mv.idMina,mv.idSubmina;`;

  connection.query(consulta, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Ocurrió un error al procesar la consulta' });
    } else {
      res.json(results);
    }
  });
};*/



module.exports.aLaFechaEmbarque =  (req, res) => {
  const consulta = `
  select m.nombre as mina, c.nombre, sum(embarque) as embarque
from mina m join embarque e using(idMina) join
concentrado c using(idConcentrado)
group by e.idMina,e.idConcentrado`;

  connection.query(consulta, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).json({ error: 'Ocurrió un error al procesar la consulta' });
    } else {
      res.json(results);
    }
  });
};



/*module.exports.insertBascula = (req, res) => {
  const datosBascula = req.body;
  const inserts = [];

  datosBascula.forEach(cant => {
    const { idUsuario, idMina, idSubmina, fecha, acarreo, trituradasP1, trituradasP2 } = cant;
    inserts.push([idUsuario, idMina, idSubmina, fecha, acarreo, trituradasP1, trituradasP2]);
  });

  connection.query('INSERT INTO movimiento_mineral (idUsuario, idMina, idSubmina, fecha, acarreo, trituradasP1, trituradasP2) ?', [inserts], (error, results) => {
    if (error) {
      console.error('Error al insertar los datos de la bascula:', error);
      res.status(500).json({ error: 'Ocurrió un error al insertar los datos de la bascula' });
    } else {
      res.json({ mensaje: 'Datos de la bascula insertados correctamente' });
    }
  });
};*/


module.exports.insertMovimientoMineral = (req, res) => {
  const datosMovimientoMineral = req.body;
  const inserts = [];

  datosMovimientoMineral.forEach(dato => {
    const { idUsuario, idMina, idSubmina, fecha, acarreo, trituradasP1, trituradasP2 } = dato;
    inserts.push([idUsuario, idMina, idSubmina, fecha, acarreo, trituradasP1, trituradasP2]);
  });

  connection.query('INSERT INTO movimiento_mineral (idUsuario, idMina, idSubmina, fecha, acarreo, trituradasP1, trituradasP2) VALUES ?', [inserts], (error, results) => {
    if (error) {
      console.error('Error al insertar los datos en movimiento_mineral:', error);
      res.status(500).json({ error: 'Ocurrió un error al insertar los datos en movimiento_mineral' });
    } else {
      res.json({ mensaje: 'Datos insertados correctamente en movimiento_mineral' });
    }
  });
};


module.exports.embarque = (req, res) => {
  const datosEmbarque = req.body;
  const inserts = [];

  datosEmbarque.forEach(dato => {
    const { idMina,idConcentrado,idUsuario,fecha,embarque } = dato;
    inserts.push([idMina,idConcentrado,idUsuario,fecha,embarque]);
  });

  connection.query('INSERT INTO embarque (idMina,idConcentrado,idUsuario,fecha,embarque) VALUES ?', [inserts], (error, results) => {
    if (error) {
      console.error('Error al insertar los datos en embarque:', error);
      res.status(500).json({ error: 'Ocurrió un error al insertar los datos en embarque' });
    } else {
      res.json({ mensaje: 'Datos insertados correctamente en embarque' });
    }
  });
};