require('dotenv').config(); // Carga las variables de entorno desde .env

const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Para seguridad adicional
const rateLimit = require('express-rate-limit'); // Para limitar peticiones

const errorController = require('./controllers/errorController');

const authRoutes = require('./routes/authRoutes');
const waterSourceRoutes = require('./routes/waterSourceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');

const app = express();
const port = process.env.PORT || 3000;

// --------------------------------------------
// 📁 Servir archivos estáticos (imágenes locales)
// --------------------------------------------
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --------------------------------------------
// 🔒 Configuración de seguridad
// --------------------------------------------

/**
 * Configuración de orígenes permitidos para CORS
 */
const allowedOrigins = [
  'http://localhost:4200', // Angular dev
  'http://localhost:3000', // React dev
  'https://droply.es', // Producción
  'https://www.droply.es',
  'https://droply1.vercel.app/' 
].filter(Boolean); // Filtra valores undefined/null

// En producción, obtener de variables de entorno
if (process.env.NODE_ENV === 'production') {
  const prodOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  allowedOrigins.push(...prodOrigins);
}

/**
 * Configuración segura de CORS
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('No permitido por política CORS'));
    }
  },
  credentials: true, // Permitir cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'], // Headers que el cliente puede leer
  maxAge: 86400, // Cachear preflight por 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204 // Para compatibilidad con navegadores legacy
};

/**
 * Rate limiting para prevenir ataques de fuerza bruta
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Incluir headers de rate limit
  legacyHeaders: false,
});

/**
 * Rate limiting más estricto para rutas de autenticación
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por IP
  message: {
    error: 'Demasiados intentos de autenticación, intenta más tarde.',
    retryAfter: '15 minutos'
  },
  skipSuccessfulRequests: true, // No contar peticiones exitosas
});

// --------------------------------------------
// 🧩 Middlewares de seguridad
// --------------------------------------------

/**
 * Helmet para configurar headers de seguridad
 */
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Puede interferir con CORS
  contentSecurityPolicy: false, // Configurar según necesidades
}));

/**
 * Rate limiting general
 */
app.use(limiter);

/**
 * CORS seguro
 */
app.use(cors(corsOptions));

/**
 * Middleware para parsear cuerpos JSON con límite de tamaño
 */
app.use(express.json({ 
  limit: '10mb', // Límite de 10MB para uploads
  type: ['application/json', 'text/plain']
}));

/**
 * Middleware para parsear datos de formularios URL-encoded
 */
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

/**
 * Middleware de logging básico
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling preflight request');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  
  next();
});

// --------------------------------------------
// 📦 Rutas principales
// --------------------------------------------

/**
 * Rutas de autenticación con rate limiting estricto
 */
app.use('/auth', authLimiter, authRoutes);

/**
 * Rutas relacionadas con fuentes de agua
 */
app.use('/api/water-sources', waterSourceRoutes);

/**
 * Rutas de valoraciones
 */
app.use('/api/reviews', reviewRoutes);

/**
 * Rutas de usuarios
 */
app.use('/api/users', userRoutes);

/**
 * Rutas de fotos
 */
app.use('/api/photos', photoRoutes);

// --------------------------------------------
// 🏠 Ruta de salud del servidor
// --------------------------------------------

/**
 * Endpoint para verificar que el servidor está funcionando
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: process.env.NODE_ENV === 'development' ? allowedOrigins : '***'
    }
  });
});

// --------------------------------------------
// 🔧 Manejo de errores CORS
// --------------------------------------------

/**
 * Middleware específico para errores de CORS
 */
app.use((err, req, res, next) => {
  if (err.message === 'No permitido por política CORS') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado por política CORS',
      message: 'Tu origen no está autorizado para acceder a este recurso'
    });
  }
  next(err);
});

/**
 * Middleware para manejar rutas no encontradas (404)
 */
app.use(errorController.notFoundHandler);

/**
 * Middleware general para manejar errores de aplicación
 */
app.use(errorController.errorHandler);

// --------------------------------------------
// 🚀 Arranque del servidor
// --------------------------------------------

const server = app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en puerto ${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`📸 Photos API: http://localhost:${port}/api/photos`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS configurado para: ${allowedOrigins.join(', ')}`);
});

// Manejo graceful de cierre del servidor
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});