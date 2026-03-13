const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Se requieren permisos de administrador' });
  }
  next();
};

// Get user from database
const getUserFromDB = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  getUserFromDB
};
