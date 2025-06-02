const mysql = require('mysql2');

// Configuración definitiva (Docker + Local)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Docker usa 'mysql', local usa 'localhost'
  user: process.env.DB_USER || 'root',      // Docker: 'devuser', local: 'root'
  database: process.env.DB_NAME || 'droply', // Siempre 'droply'
  password: process.env.DB_PASSWORD || '',  // Docker: 'devpass', local: vacío
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 segundos de timeout
  charset: 'utf8mb4'     // Para soportar caracteres especiales
});

// Verificación de conexión mejorada
const checkConnection = async () => {
  try {
    const connection = await pool.promise().getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    console.log(`📊 Base de datos: ${connection.config.database}`);
    connection.release();
    
    // Verificar tablas (opcional)
    const [tables] = await pool.promise().query('SHOW TABLES');
    console.log(`🗂 Tablas detectadas: ${tables.length}`);
    
  } catch (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    console.log('ℹ️ Variables de entorno actuales:', {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      NODE_ENV: process.env.NODE_ENV
    });

    // Sugerencias específicas por tipo de error
    if (err.code === 'ECONNREFUSED') {
      console.log('\n🔧 Solución sugerida:');
      console.log('1. Verifica que MySQL esté corriendo');
      console.log('2. Revisa el puerto (3306) y credenciales');
      if (process.env.NODE_ENV === 'development') {
        console.log('3. Para Docker: ejecuta "docker-compose up -d mysql"');
      }
    }
    process.exit(1); // Termina la aplicación si no puede conectar
  }
};

// Ejecutar verificación al iniciar (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  checkConnection();
}

module.exports = {
  pool: pool.promise(),
  checkConnection // Exportamos para poder usarla manualmente
};