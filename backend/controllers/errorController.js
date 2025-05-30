// error middleware

exports.notFoundHandler = (req, res, next) => {
  const error = new Error('No encontrado.');
  error.statusCode = 404;
  next(error);
};

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
