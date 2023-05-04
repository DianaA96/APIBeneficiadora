require('dotenv').config();

/*var config = {
    host: process.env.DBhost,
    user: process.env.DBuser,
    password: process.env.DBpassword,
    database: process.env.Namedatabase,
    port: process.env.DBport
}*/

var config = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'dbpurisima',
    port: 3306
}
module.exports = config;