/**
 * Global error handling middleware for the UrbanRent API
 * Provides consistent error responses and logging
 */

const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error occurred:', err);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server';
  
  // Handle specific error types
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    statusCode = 503;
    message = 'Database connection error';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  // In production, don't expose error details
  const error = process.env.NODE_ENV === 'production' 
    ? { message } 
    : { message, stack: err.stack, details: err };
  
  // Send the error response
  res.status(statusCode).json({
    success: false,
    error
  });
};

module.exports = errorHandler;
