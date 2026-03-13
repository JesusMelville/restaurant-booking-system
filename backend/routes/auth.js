const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener 2-100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('phone').optional().isMobilePhone().withMessage('Teléfono inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (user) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      db.run(
        `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, phone],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error al crear usuario' });
          }

          // Create token
          const token = jwt.sign(
            { id: this.lastID, email, role: 'client' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          );

          res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: {
              id: this.lastID,
              name,
              email,
              phone,
              role: 'client'
            }
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Error del servidor' });
        }

        if (!user) {
          return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Create token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
          message: 'Login exitoso',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await require('../middleware/auth').getUserFromDB(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener estadísticas de reservas del usuario
    const { db } = require('../config/database');
    
    db.all(
      `SELECT 
         COUNT(*) as total,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed,
         COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
         COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled,
         COALESCE(SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END), 0) as no_show
       FROM reservations 
       WHERE user_id = ?`,
      [req.user.id],
      (err, stats) => {
        if (err) {
          console.error('Error getting user stats:', err);
          // En caso de error, devolver el usuario sin estadísticas
          return res.json({ user });
        }

        const userStats = stats[0] || {
          total: 0,
          completed: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
          no_show: 0
        };

        res.json({ 
          user: {
            ...user,
            stats: userStats
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone } = req.body;
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error al actualizar perfil' });
        }

        res.json({ message: 'Perfil actualizado exitosamente' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
