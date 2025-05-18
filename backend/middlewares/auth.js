// middlewares/auth.js
const jwt = require('jsonwebtoken');

// Usa tu clave privada, normalmente puesta en process.env.JWT_PRIVATE_KEY
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

  // El login pone "userId" en el token (¡ojo, no "id"!)
  req.user = {
    id: decodedToken.userId,
    email: decodedToken.email
    // ...puedes añadir aquí otros campos si los metiste en el payload
  };

  next();
};
