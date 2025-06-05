// routes/photoRoutes.js
const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photoController');
const upload = require('../middlewares/multer');
const auth = require('../middlewares/authMiddleware'); 

// Ruta para subir foto
router.post('/upload', auth, upload.single('photo'), PhotoController.uploadPhoto);

// Otras rutas
router.get('/', auth, PhotoController.getAllPhotos);
router.get('/my-photos', auth, PhotoController.getMyPhotos);
router.get('/pending', auth, PhotoController.getPendingPhotos); // Solo admin
router.get('/water-source/:waterSourceId', PhotoController.getPhotosByWaterSource);
router.get('/review/:reviewId', PhotoController.getPhotosByReview);
router.get('/:id', PhotoController.getPhotoById);
router.patch('/:id/status', auth, PhotoController.updatePhotoStatus); // Solo admin
router.delete('/:id', auth, PhotoController.deletePhoto);

module.exports = router;