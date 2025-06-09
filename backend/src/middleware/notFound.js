/**
 * 404 Not Found middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const notFound = (req, res) => {
  res.status(404).json({ error: `Resource not found - ${req.originalUrl}` });
}; 