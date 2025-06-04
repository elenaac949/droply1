const mysql = require('mysql2');

// Usar variables de entorno con fallback a config.json
const config = {
  host: process.env.DB_HOST || require('../config/config.json').host,
  user: process.env.DB_USER || require('../config/config.json').user,
  database: process.env.DB_NAME || require('../config/config.json').database,
  password: process.env.DB_PASSWORD || require('../config/config.json').password,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // Reemplaza a timeout
  idleTimeout: 60000,   // Tiempo máximo de inactividad para una conexión
  enableKeepAlive: true, // Reemplaza parcialmente a reconnect
  keepAliveInitialDelay: 10000
};

const pool = mysql.createPool(config);

module.exports = pool.promise();