const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message, err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate entry. Resource already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource not found.' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === 500 ? 'Internal server error' : message,
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
};

module.exports = { errorHandler, notFound };
