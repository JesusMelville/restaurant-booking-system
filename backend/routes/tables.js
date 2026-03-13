const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all tables (with optional restaurant filter)
router.get('/', (req, res) => {
  const { restaurant_id, status } = req.query;

  let query = `
    SELECT t.*, r.name as restaurant_name 
    FROM tables t 
    JOIN restaurants r ON t.restaurant_id = r.id 
    WHERE 1=1
  `;
  let params = [];

  if (restaurant_id) {
    query += ' AND t.restaurant_id = ?';
    params.push(restaurant_id);
  }

  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.name, t.table_number';

  db.all(query, params, (err, tables) => {
    if (err) {
      return res.status(500).json({ message: 'Error del servidor' });
    }

    res.json({ tables });
  });
});

// Get table by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT t.*, r.name as restaurant_name 
     FROM tables t 
     JOIN restaurants r ON t.restaurant_id = r.id 
     WHERE t.id = ?`,
    [id],
    (err, table) => {
      if (err) {
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (!table) {
        return res.status(404).json({ message: 'Mesa no encontrada' });
      }

      res.json({ table });
    }
  );
});

// Create table (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('restaurant_id').isInt({ min: 1 }).withMessage('ID de restaurante inválido'),
  body('table_number').trim().isLength({ min: 1, max: 10 }).withMessage('Número de mesa inválido'),
  body('capacity').isInt({ min: 1, max: 20 }).withMessage('Capacidad debe ser entre 1 y 20'),
  body('min_capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Capacidad mínima inválida'),
  body('location').optional().trim().isLength({ max: 50 }).withMessage('Ubicación inválida'),
  body('table_type').optional().isIn(['standard', 'vip', 'private', 'outdoor']).withMessage('Tipo de mesa inválido'),
  body('status').optional().isIn(['available', 'unavailable', 'maintenance']).withMessage('Estado inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    restaurant_id, table_number, capacity, min_capacity = 1,
    location, table_type = 'standard', status = 'available'
  } = req.body;

  // Check if table number already exists for this restaurant
  db.get(
    'SELECT id FROM tables WHERE restaurant_id = ? AND table_number = ?',
    [restaurant_id, table_number],
    (err, existingTable) => {
      if (err) {
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (existingTable) {
        return res.status(400).json({ message: 'El número de mesa ya existe en este restaurante' });
      }

      db.run(
        `INSERT INTO tables (
          restaurant_id, table_number, capacity, min_capacity, 
          location, table_type, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [restaurant_id, table_number, capacity, min_capacity, location, table_type, status],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error al crear mesa' });
          }

          res.status(201).json({
            message: 'Mesa creada exitosamente',
            tableId: this.lastID
          });
        }
      );
    }
  );
});

// Update table (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('table_number').optional().trim().isLength({ min: 1, max: 10 }),
  body('capacity').optional().isInt({ min: 1, max: 20 }),
  body('min_capacity').optional().isInt({ min: 1, max: 20 }),
  body('location').optional().trim().isLength({ max: 50 }),
  body('table_type').optional().isIn(['standard', 'vip', 'private', 'outdoor']),
  body('status').optional().isIn(['available', 'unavailable', 'maintenance'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updates = [];
  const values = [];

  const allowedFields = [
    'table_number', 'capacity', 'min_capacity', 
    'location', 'table_type', 'status'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No hay campos para actualizar' });
  }

  values.push(id);

  db.run(
    `UPDATE tables SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error al actualizar mesa' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Mesa no encontrada' });
      }

      res.json({ message: 'Mesa actualizada exitosamente' });
    }
  );
});

// Delete table (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Check if table has existing reservations
  db.get(
    'SELECT id FROM reservations WHERE table_id = ? AND status IN ("pending", "confirmed")',
    [id],
    (err, reservation) => {
      if (err) {
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (reservation) {
        return res.status(400).json({ 
          message: 'No se puede eliminar la mesa. Tiene reservas activas.' 
        });
      }

      db.run('DELETE FROM tables WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error al eliminar mesa' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Mesa no encontrada' });
        }

        res.json({ message: 'Mesa eliminada exitosamente' });
      });
    }
  );
});

// Get table availability for specific date
router.get('/:id/availability', (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Fecha requerida' });
  }

  // Get table info
  db.get('SELECT * FROM tables WHERE id = ?', [id], (err, table) => {
    if (err) {
      return res.status(500).json({ message: 'Error del servidor' });
    }

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    // Get existing reservations for the date
    db.all(
      `SELECT reservation_time, party_size 
       FROM reservations 
       WHERE table_id = ? AND reservation_date = ? AND status IN ('pending', 'confirmed')
       ORDER BY reservation_time`,
      [id, date],
      (err, reservations) => {
        if (err) {
          return res.status(500).json({ message: 'Error del servidor' });
        }

        // Generate time slots from 11:00 to 23:30
        const timeSlots = [];
        for (let hour = 11; hour <= 23; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSlots.push(time);
          }
        }

        const availability = timeSlots.map(time => {
          const conflictingReservation = reservations.find(res => {
            const resTime = res.reservation_time.substring(0, 5);
            const resHour = parseInt(resTime.split(':')[0]);
            const resMinute = parseInt(resTime.split(':')[1]);
            const slotHour = parseInt(time.split(':')[0]);
            const slotMinute = parseInt(time.split(':')[1]);
            
            // Check if reservation conflicts with time slot (2-hour window)
            const timeDiff = Math.abs((resHour * 60 + resMinute) - (slotHour * 60 + slotMinute));
            return timeDiff < 120;
          });

          return {
            time,
            available: !conflictingReservation,
            reservation: conflictingReservation || null
          };
        });

        res.json({
          table,
          date,
          availability
        });
      }
    );
  });
});

module.exports = router;
