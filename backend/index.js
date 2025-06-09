const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://user-man1-seven.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

const usersRouter = require('./routes/users');
app.use('/user-management-api/users', usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
