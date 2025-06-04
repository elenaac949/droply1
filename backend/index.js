require('dotenv').config(); // Carga las variables de entorno desde .env

const express = require('express');
const errorController = require('./controllers/errorController');

const authRoutes = require('./routes/authRoutes');
const waterSourceRoutes = require('./routes/waterSourceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes'); // ← AGREGADO

const app = express();
const ports = process.env.PORT || 3000;

// --------------------------------------------
// 🧩 Middlewares
// --------------------------------------------

/**
 * Middleware para parsear cuerpos JSON en las peticiones.
 */
app.use(express.json());

/**
 * Middleware para parsear datos de formularios URL-encoded
 */
app.use(express.urlencoded({ extended: true })); // ← AGREGADO para mejor compatibilidad

/**
 * Middleware para habilitar CORS (permite peticiones desde otros orígenes).
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todos los orígenes
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE'); // ← AGREGADO PATCH
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeceras permitidas
  
  // Manejar preflight requests para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// --------------------------------------------
// 📦 Rutas principales
// --------------------------------------------

/**
 * Rutas de autenticación: /auth/signup, /auth/login
 */
app.use('/auth', authRoutes);

/**
 * Rutas relacionadas con fuentes de agua: CRUD, estado, filtrado
 */
app.use('/api/water-sources', waterSourceRoutes);

/**
 * Rutas de valoraciones: crear, moderar, listar
 */
app.use('/api/reviews', reviewRoutes);

/**
 * Rutas de usuarios: perfil, email, contraseña
 */
app.use('/api/users', userRoutes);

/**
 * Rutas de fotos: crear, moderar, listar por fuente/reseña
 */
app.use('/api/photos', photoRoutes); // ← AGREGADO

// --------------------------------------------
// 🏠 Ruta de salud del servidor (opcional pero recomendada)
// --------------------------------------------

/**
 * Endpoint para verificar que el servidor está funcionando
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------
//  Manejo de errores
// --------------------------------------------

/**
 * Middleware para manejar rutas no encontradas (404).
 */
app.use(errorController.notFoundHandler);

/**
 * Middleware general para manejar errores de aplicación.
 */
app.use(errorController.errorHandler);

// --------------------------------------------
// 🚀 Arranque del servidor
// --------------------------------------------

app.listen(ports, () => {
  console.log(` Servidor escuchando en puerto ${ports}`);
  console.log(` Health check: http://localhost:${ports}/health`);
  console.log(` Photos API: http://localhost:${ports}/api/photos`);
});