const express = require('express');
const cors = require('cors');
const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Routes
const usersRouter = require('./routes/users');
app.use('/user-management-api/users', usersRouter); // Note: no "1" here

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));