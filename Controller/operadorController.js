const { response, request } = require('express');
const mysql = require('mysql');
const config = require('../helpers/config')
const connection = mysql.createConnection(config, { multipleStatements: true });

connection.connect(error => {
  if (error) throw error;
  console.log('Conected operadorRD');
});

// Función para insertar los datos en la tabla 'acarreo'
const insertarAcarreo = (datosAcarreo) => {
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

    //console.log(req.body.datos)
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
  }
  
