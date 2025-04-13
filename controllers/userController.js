// File: controllers/userController.js

const bcrypt = require('bcrypt');
const pool = require('../db');

exports.signup = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, role]
    );

    res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in signup:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
};
