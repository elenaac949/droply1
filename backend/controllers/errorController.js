/**
 * Middleware para manejar rutas no encontradas (404).
 *
 * Este middleware se ejecuta cuando ninguna ruta coincide con la solicitud recibida.
 * Crea un objeto `Error` con mensaje "No encontrado" y código HTTP 404, que se envía
 * al siguiente middleware de manejo de errores.
 *
 * @function
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función next para pasar el error al siguiente middleware.
 */
exports.notFoundHandler = (req, res, next) => {
  const error = new Error('No encontrado.');
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware general para el manejo de errores en la aplicación.
 *
 * Este middleware captura cualquier error que ocurra en el backend y devuelve
 * una respuesta JSON estandarizada con el código de estado HTTP, el mensaje de error
 * y datos adicionales si existen.
 *
 * @function
 * @param {Error} error - Objeto de error lanzado.
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función next (no se usa, pero es requerida por Express).
 */
exports.errorHandler = (error, req, res, next) => {
  const status = error.statusCode || 500;
  const data = error.data || null;

  res.status(status).json({
    error: {
      message: error.message || 'Error del servidor.',
      data: data
    }
  });
};
