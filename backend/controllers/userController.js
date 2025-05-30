const User = require('../models/userModel');

/* Obtener todos los usuarios */
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

/* Borrar usuario */
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await User.deleteById(userId);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
