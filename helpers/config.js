require('dotenv').config();

var config = {
    host: process.env.DBhost,
    user: process.env.DBuser,
    password: process.env.DBpassword,
    database: process.env.Namedatabase,
    port: process.env.DBport
}
module.exports = config;