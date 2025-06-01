const mysql = require('mysql2');
const config = require('../config/config.json');

/**
 * Crea un pool de conexiones MySQL reutilizable.
 * 
 * Este pool gestiona múltiples conexiones a la base de datos y permite 
 * realizar consultas asincrónicas usando promesas (con `.promise()`).
 * 
 * La configuración se obtiene del archivo config/config.json:
 *  - host: servidor de base de datos (ej. 'localhost')
 *  - user: usuario de acceso (ej. 'root')
 *  - database: nombre de la base de datos (ej. 'droply')
 *  - password: contraseña de acceso (vacía en desarrollo)
 */
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  database: config.database,
  password: config.password
});

// Exporta el pool con soporte para promesas (async/await)
module.exports = pool.promise();
