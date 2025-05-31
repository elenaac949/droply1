const User = require('../models/userModel');
const bcrypt = require('bcrypt');

/* Crear un nuevo usuario */
exports.createUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10);
    // Guardar con la contraseña hasheada
    await User.save({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};
/* editar un usuario */
exports.updateUser = async (req, res) => {
  const { username, email } = req.body;
  const { id } = req.params;

  try {
    await User.update(id, { username, email });
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};


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
