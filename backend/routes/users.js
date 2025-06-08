const express = require('express');
const router = express.Router();

// In-memory users array for demo purposes
// Replace this with your DB logic
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active', password_hash: 'hashedpassword1' },
  { id: 2, name: 'Bob', email: 'bob@example.com', status: 'blocked', password_hash: 'hashedpassword2' },
];

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Get user by id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Add new user
router.post('/', (req, res) => {
  const { name, email, status, password_hash } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Simple email uniqueness check
  const emailExists = users.some(u => u.email === email);
  if (emailExists) {
    return res.status(400).json({ error: 'Email already in use' });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name,
    email,
    status: status || 'active',
    password_hash: password_hash || '',
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user by id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  const { name, email, status, password_hash } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Optional: check if email is unique for other users
  const emailExists = users.some(u => u.email === email && u.id !== id);
  if (emailExists) {
    return res.status(400).json({ error: 'Email already in use by another user' });
  }

  // Update the user
  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    status: status || users[userIndex].status,
    password_hash: password_hash !== undefined ? password_hash : users[userIndex].password_hash,
  };

  res.json(users[userIndex]);
});

// Delete user by id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  users.splice(userIndex, 1);
  res.status(204).send(); // No content on successful deletion
});

module.exports = router;
