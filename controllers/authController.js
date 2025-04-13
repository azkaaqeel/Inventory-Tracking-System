
const pool = require('../db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { username, password, role, store_id } = req.body;
  if (!username || !password || !role) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username, password, role, store_id)
       VALUES ($1, $2, $3, $4)`,
      [username, hashedPassword, role, store_id || null]
    );
    res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send({ error: 'Username and password required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    res.send({ message: 'Login successful', user: { id: user.id, role: user.role, store_id: user.store_id } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ error: 'Server error' });
  }
};
