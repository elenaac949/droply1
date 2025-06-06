// middlewares/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación para rutas protegidas.
 * 
 * Verifica la existencia y validez de un token JWT enviado en la cabecera Authorization.
 * Si es válido, agrega los datos del usuario a `req.user`.
 * 
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para continuar con la siguiente capa del middleware.
 */
module.exports = (req, res, next) => {
  // El frontend debe mandar el token así: Authorization: Bearer <token>
  const authHeader = req.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado, falta el token.' });
  }

  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
  if (!decodedToken) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  // Esta función isAdmin está definida aquí pero no se puede usar fuera
  /**
   * Middleware local para validar si el usuario es administrador.
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {Function} next 
   */
  function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo admins pueden hacer esto' });
    }
    next();
  }

  req.user = {
    id: decodedToken.userId,
    email: decodedToken.email
  };

  next();
};
