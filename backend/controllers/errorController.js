/**
 * Middleware para manejar rutas no encontradas (404).
 *
 * Se ejecuta cuando ninguna ruta coincide con la solicitud.
 * Crea un objeto Error con código de estado 404.
 *
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función next para pasar el error.
 */
exports.notFoundHandler = (req, res, next) => {
  const error = new Error('No encontrado.');
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware general para el manejo de errores.
 *
 * Captura errores lanzados en cualquier parte de la aplicación y devuelve
 * una respuesta JSON con el mensaje y los datos adicionales si existen.
 *
 * @param {Error} error - Objeto de error lanzado.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función next (no usada, pero requerida por Express).
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
