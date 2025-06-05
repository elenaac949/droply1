const express = require('express');
const router = express.Router();

const PhotoController = require('../controllers/photoController');
const isAuth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer'); // debes tener multer configurado

// Subir una nueva foto (requiere autenticación y archivo)
router.post('/', isAuth, upload.single('file'), PhotoController.uploadPhoto);

// Obtener todas las fotos (con filtros opcionales)
router.get('/', PhotoController.getAllPhotos);

// Obtener una foto por su ID
router.get('/:id', PhotoController.getPhotoById);

// Obtener fotos por fuente de agua
router.get('/water-source/:waterSourceId', PhotoController.getPhotosByWaterSource);

// Obtener fotos por reseña
router.get('/review/:reviewId', PhotoController.getPhotosByReview);

// Obtener fotos del usuario autenticado
router.get('/mine', isAuth, PhotoController.getMyPhotos);

// Actualizar el estado de una foto (requiere autenticación, normalmente admin)
router.patch('/:id/status', isAuth, PhotoController.updatePhotoStatus);

// Eliminar una foto (requiere autenticación y permisos del usuario o admin)
router.delete('/:id', isAuth, PhotoController.deletePhoto);

// Obtener fotos pendientes de moderación (requiere autenticación, normalmente admin)
router.get('/moderation/pending', isAuth, PhotoController.getPendingPhotos);

module.exports = router;
