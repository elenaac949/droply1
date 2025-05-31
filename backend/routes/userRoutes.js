const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/exists', userController.checkEmailExists);
router.get('/:id', userController.getUserById);
router.post('/verify-password/:userId', userController.verifyPassword);
router.delete('/:id', userController.deleteUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.updatePassword);





module.exports = router;
