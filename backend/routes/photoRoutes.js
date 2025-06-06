// routes/photoRoutes.js
const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photoController');
const upload = require('../middlewares/multer');
const auth = require('../middlewares/authMiddleware');

/**
 * @route POST /upload
 * @desc Sube una nueva foto relacionada con una fuente o reseña.
 * @access Privado (requiere autenticación)
 * @middleware `upload.single('photo')` para procesar la imagen
 */
router.post('/upload', auth, upload.single('photo'), PhotoController.uploadPhoto);

/**
 * @route GET /
 * @desc Obtiene todas las fotos del sistema.
 * @access Privado
 */
router.get('/', auth, PhotoController.getAllPhotos);

/**
 * @route GET /my-photos
 * @desc Obtiene las fotos subidas por el usuario autenticado.
 * @access Privado
 */
router.get('/my-photos', auth, PhotoController.getMyPhotos);

/**
 * @route GET /water-source/:waterSourceId
 * @desc Obtiene todas las fotos asociadas a una fuente de agua.
 * @access Público
 */
router.get('/water-source/:waterSourceId', PhotoController.getPhotosByWaterSource);

/**
 * @route GET /review/:reviewId
 * @desc Obtiene todas las fotos asociadas a una reseña.
 * @access Público
 */
router.get('/review/:reviewId', PhotoController.getPhotosByReview);

/**
 * @route GET /:id
 * @desc Obtiene los detalles de una foto específica por su ID.
 * @access Público
 */
router.get('/:id', PhotoController.getPhotoById);

/**
 * @route DELETE /:id
 * @desc Elimina una foto específica por ID (solo el propietario o admin).
 * @access Privado
 */
router.delete('/:id', auth, PhotoController.deletePhoto);

module.exports = router;
