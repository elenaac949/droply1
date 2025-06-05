const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadProfilePicture = require('../middlewares/profileMulter');

const router = express.Router();



router.put('/:id/profile-picture', authMiddleware, uploadProfilePicture, userController.uploadProfilePicture);
router.delete('/:id/profile-picture', authMiddleware, userController.deleteProfilePicture);

/**
 * @route GET /users/
 * @desc Obtiene la lista de todos los usuarios con rol "user".
 * @access Público o restringido según implementación
 */
router.get('/', userController.getAllUsers);

/**
 * @route GET /users/exists?email=
 * @desc Verifica si un email ya está registrado.
 * @access Público
 */
router.get('/exists', userController.checkEmailExists);

/**
 * @route POST /users/
 * @desc Crea un nuevo usuario.
 * @access Público (usado en registro externo o testing)
 */
router.post('/', userController.createUser);


/**
 * @route POST /users/verify-password/:userId
 * @desc Verifica si la contraseña actual introducida es correcta.
 * @access Privado (requiere autenticación)
 */
router.post('/verify-password/:userId', userController.verifyPassword);

/**
 * @route PUT /users/:id
 * @desc Actualiza los datos de un usuario (excepto la contraseña).
 * @access Privado (requiere autenticación)
 */
router.put('/:id', userController.updateUser);

/**
 * @route PUT /users/:id/password
 * @desc Actualiza la contraseña de un usuario.
 * @access Privado (requiere autenticación)
 */
router.put('/:id/password', userController.updatePassword);

/**
 * @route GET /users/:id
 * @desc Obtiene un usuario por su ID.
 * @access Privado o restringido
 */
router.get('/:id', userController.getUserById);

/**
 * @route DELETE /users/:id
 * @desc Elimina un usuario por su ID.
 * @access Admin (recomendado)
 */
router.delete('/:id', userController.deleteUser);




module.exports = router;
