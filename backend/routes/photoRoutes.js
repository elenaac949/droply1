const express = require('express');
const { body, param, query } = require('express-validator');
const PhotoController = require('../controllers/photoController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Validaciones
const photoValidation = [
  body('url')
    .isURL()
    .withMessage('URL de la foto debe ser válida')
    .isLength({ max: 255 })
    .withMessage('URL no puede exceder 255 caracteres'),
  
  body('water_source_id')
    .optional()
    .isUUID()
    .withMessage('ID de fuente de agua debe ser un UUID válido'),
  
  body('review_id')
    .optional()
    .isUUID()
    .withMessage('ID de reseña debe ser un UUID válido')
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Estado debe ser: pending, approved o rejected')
];

const idValidation = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

const queryValidation = [
  query('water_source_id')
    .optional()
    .isUUID()
    .withMessage('water_source_id debe ser un UUID válido'),
  
  query('review_id')
    .optional()
    .isUUID()
    .withMessage('review_id debe ser un UUID válido'),
  
  query('user_id')
    .optional()
    .isUUID()
    .withMessage('user_id debe ser un UUID válido'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('status debe ser: pending, approved o rejected'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser un número entre 1 y 100')
];

// ========== RUTAS PÚBLICAS ==========

// Obtener todas las fotos (con filtros opcionales)
router.get('/', queryValidation, PhotoController.getAllPhotos);

// Obtener foto por ID
router.get('/:id', idValidation, PhotoController.getPhotoById);

// Obtener fotos por fuente de agua
router.get('/water-source/:waterSourceId', 
  param('waterSourceId').isUUID().withMessage('waterSourceId debe ser un UUID válido'),
  PhotoController.getPhotosByWaterSource
);

// Obtener fotos por reseña
router.get('/review/:reviewId', 
  param('reviewId').isUUID().withMessage('reviewId debe ser un UUID válido'),
  PhotoController.getPhotosByReview
);

// ========== RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN) ==========

// Crear nueva foto
router.post('/', authMiddleware, photoValidation, PhotoController.createPhoto);

// Obtener mis fotos
router.get('/user/my-photos', authMiddleware, PhotoController.getMyPhotos);

// Obtener estadísticas de mis fotos
router.get('/user/stats', authMiddleware, PhotoController.getPhotoStats);

// Eliminar foto (solo el propietario o admin)
router.delete('/:id', authMiddleware, idValidation, PhotoController.deletePhoto);

// ========== RUTAS DE ADMINISTRACIÓN ==========

// Obtener fotos pendientes de moderación (solo admin)
router.get('/admin/pending', 
  authMiddleware,
  PhotoController.getPendingPhotos
);

// Actualizar estado de foto (solo admin)
router.patch('/:id/status', 
  authMiddleware,
  idValidation, 
  statusValidation, 
  PhotoController.updatePhotoStatus
);

module.exports = router;