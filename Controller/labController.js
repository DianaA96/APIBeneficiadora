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

    try {
        for (let q = 1; q <= 3; q++) {
            var sql1 = `INSERT INTO Analisis(idUsuario,idMina,idPlanta,fechaMuestreo,fechaEnsaye,turno) 
            values(${bod.idUsuario},${bod.idMina},${bod.idPlanta},'${bod.fechaMuestreo}','${bod.fechaEnsaye}',${q.toString()});`; //Aqui se crea el reporte
            var turno = bod[turnos["k" + q]]

            connection.query(sql1, (error, rows) => {
                if (error) {
                    if (error.code === "ERR_HTTP_HEADERS_SENT") {
                        return response.status(200).json("sabrosito");
                    }
                    response.send(error);
                } else {
                    let idAnalisis = rows.insertId; //Guardas el id nuevo que es el id del reporte nuevo generado
                    //El primer for con la funcion Object Keys lee los concentrados por nombre y los convierte en id
                    for (let i = 0; i < Object.keys(turno).length; i++) {

                        let concentrado = Object.keys(turno)[i] //Se guarda el concentrado que es
                        console.log("Concentrado: ", concentrado)

                        //El segundo for con la funcion Object Keys lee los elementos por nombre y los convierte en id
                        for (let j = 0; j < Object.keys(turno[concentrado]).length; j++) {

                            let elemento = Object.keys(turno[concentrado])[j] //Guarda el elemento que es
                            let porcentaje = turno[concentrado][elemento] //Guarda el porcentaje del elemento

                            console.log(elemento, ":", porcentaje)

                            //El siguiente sql almacena los valores en la tabla por medio de id.
                            var sqlIdC = `
                            INSERT INTO Laboratorio(idAnalisis,idConcentrado,idElemento,gton) 
                            VALUES(${idAnalisis},(SELECT idConcentrado FROM Concentrado where nombre = '${concentrado}'),
                            (SELECT idElemento FROM Elemento where nombre = '${elemento}'),${porcentaje})`
                            connection.query(sqlIdC, (error, rows) => {
                                if (error) {
                                    if (error.code === "ERR_HTTP_HEADERS_SENT") {
                                        return response.status(200).json("sabrosito");
                                    }
                                    response.send(error);
                                }

                            })
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.log(e)
    }
    setTimeout(() => {
        response.status(200).json({ Message: 'Fin' });
    }, 3000); // 10 seconds
};

module.exports.LabTable = (req, res) => {
    const query = `SELECT 
                    Analisis.idAnalisis AS idAnalisis,
                    Concentrado.nombre AS nombre_concentrado,
                    Elemento.nombre AS nombre_elemento,
                    Laboratorio.gton AS gton,    
                    Mina.nombre AS nombre_mina,
                    Planta.nombre AS nombre_planta,
                    Analisis.turno AS turno
                FROM 
                    Laboratorio 
                    INNER JOIN Analisis ON Laboratorio.idAnalisis = Analisis.idAnalisis 
                    INNER JOIN Elemento ON Laboratorio.idElemento = Elemento.idElemento
                    INNER JOIN Concentrado ON Laboratorio.idConcentrado = Concentrado.idConcentrado
                    INNER JOIN Mina ON Analisis.idmina = Mina.idMina
                    INNER JOIN Planta ON Planta.idPlanta = Analisis.idPlanta
                WHERE 
                    Mina.nombre LIKE '${req.query.mina}' AND
                    Planta.nombre LIKE '${req.query.planta}' AND
                    Analisis.fechaEnsaye LIKE '${req.query.fecha}'

                GROUP BY 
                    Laboratorio.idConcentrado, 
                    Laboratorio.idElemento, 
                    Laboratorio.gton, 
                    Analisis.idAnalisis, 
                    Analisis.turno
                ORDER BY 
                    Analisis.idAnalisis
                `;

    connection.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
}