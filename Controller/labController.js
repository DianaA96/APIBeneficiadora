const { response, request } = require('express');
const mysql = require('mysql');
const config = require('../helpers/config')
const connection = mysql.createConnection(config, { multipleStatements: true });

connection.connect(error => {
    if (error) throw error;
    console.log('Conected Lab');
});

/* Este codigo genera los reportes y luego lo relaciona con las tablas 
de cada concentrado y a su vez con cada uno de los elementos */
module.exports.LabReport = (request, response) => {
    var sqlIdC = '';
    var bod = request.body;
    let turnos = new Object();
    turnos.k1 = "primerT";
    turnos.k2 = "segundoT";
    turnos.k3 = "tercerT";


    for (let i = 1; i <= 3; i++) {
        var sql1 = `INSERT INTO Analisis(idUsuario,idMina,idPlanta,fechaMuestreo,fechaEnsaye,turno) 
        values(${bod.idUsuario},${bod.idMina},${bod.idPlanta},'${bod.fechaMuestreo}','${bod.fechaEnsaye}',${i.toString()});`; //Aqui se crea el reporte

        var turno = bod[turnos["k" + i]]

        connection.query(sql1, (error, rows) => {

            if (error) {
                response.send(error);
            } else {
                let idAnalisis = rows.insertId; //Guardas el id nuevo que es el id del reporte nuevo generado

                console.log(turnos["k" + i], "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                //El primer for con la funcion Object Keys lee los concentrados por nombre y los convierte en id
                for (let i = 0; i < Object.keys(turno).length; i++) {
                    let concentrado = Object.keys(turno)[i] //Se guarda el concentrado que es
                    console.log(concentrado)
                    //El segundo for con la funcion Object Keys lee los elementos por nombre y los convierte en id
                    for (let j = 0; j < Object.keys(turno[concentrado]).length; j++) {
                        let elemento = Object.keys(turno[concentrado])[j] //Guarda el elemento que es
                        let porcentaje = turno[concentrado][elemento] //Guarda el porcentaje del elemento

                        console.log(elemento, ":", porcentaje)

                        var sqlIdC = `INSERT INTO Laboratorio(idAnalisis,idConcentrado,idElemento,gton)
                         values(${idAnalisis},(SELECT idConcentrado FROM Concentrado where nombre = '${concentrado}'),
                         (SELECT idElemento FROM Elemento where nombre = '${elemento}'),${porcentaje})`

                        connection.query(sqlIdC, (error, rows) => {
                            if (error) {
                                response.send(error)
                            } else {
                                //Hasta el momento no retorna nada, la peticion no tiene respuesta aun pero ya guarda en DB
                                console.log(rows)
                            }
                        })
                    }
                }
            }
        });
    }
    /* Meter esto en BD
    INSERT INTO elemento (idElemento, nombre) VALUES
    (1, "Pg"),
    (2, "Pb"),
    (3, "Zn"),
    (4, "Cu"),
    (5, "Fe"),
    (6, "Sb"),
    (7, "As"),
    (8, "Cd"),
    (9, "PbO"),
    (10, "ZnO");
    
    */
};
