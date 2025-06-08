const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all users
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, name, email, status, registration_time FROM users1 ORDER BY id ASC';
    let params = [];

    if (search) {
      query = 'SELECT id, name, email, status, registration_time FROM users1 WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY id ASC';
      params = [`%${search}%`];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password_hash, status = 'active' } = req.body;

    if (!name || !email || !password_hash) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const result = await pool.query(
      'INSERT INTO users1 (name, email, password_hash, status) VALUES ($1, $2, $3, $4) RETURNING id, name, email, status, registration_time',
      [name, email, password_hash, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user', details: error.message });
  }
});

// PUT: Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password_hash, status } = req.body;

    const userCheck = await pool.query('SELECT * FROM users1 WHERE id = $1', [id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email && email !== userCheck.rows[0].email) {
      const emailCheck = await pool.query('SELECT * FROM users1 WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.rowCount > 0) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
    }

    let query, params;

    if (password_hash) {
      query = `
        UPDATE users1 SET 
          name = COALESCE($1, name),
          email = COALESCE($2, email),
          password_hash = $3,
          status = COALESCE($4, status)
        WHERE id = $5
        RETURNING name, email, status, id, registration_time
      `;
      params = [name, email, password_hash, status, id];
    } else {
      query = `
        UPDATE users1 SET 
          name = COALESCE($1, name),
          email = COALESCE($2, email),
          status = COALESCE($3, status)
        WHERE id = $4
        RETURNING name, email, status, id, registration_time
      `;
      params = [name, email, status, id];  // Fixed indices here
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// DELETE user by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userCheck = await pool.query('SELECT * FROM users1 WHERE id = $1', [id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await pool.query(
      'DELETE FROM users1 WHERE id = $1 RETURNING id, name, email, status, registration_time',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Cannot delete user - user has associated records',
        details: error.detail
      });
    }

    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

module.exports = router;
