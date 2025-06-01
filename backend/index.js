require('dotenv').config(); // Carga las variables de entorno desde .env

const express = require('express');
const errorController = require('./controllers/errorController');

const authRoutes = require('./routes/authRoutes');
const waterSourceRoutes = require('./routes/waterSourceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

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
 * Middleware para habilitar CORS (permite peticiones desde otros orígenes).
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todos los orígenes
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE'); // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeceras permitidas
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

// --------------------------------------------
// ❗ Manejo de errores
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
//  Arranque del servidor
// --------------------------------------------

app.listen(ports, () => {
  console.log(`Escuchando el puerto ${ports}`);
});
