//require('dotenv').config();

var config = {
    host: process.env.CUSTOMCONSSTR_DBhost,
    user: process.env.CUSTOMCONSSTR_DBuser,
    password: process.env.CUSTOMCONSSTR_DBpassword,
    database: process.env.CUSTOMCONSSTR_Namedatabase,
    port: process.env.CUSTOMCONSSTR_DBport
}

/* 
var config = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'dbpurisima',
    port: 8889
}*/

module.exports = config
