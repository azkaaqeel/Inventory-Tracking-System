const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',               // default user
  host: 'localhost',
  database: 'inventory_system',
  password: 'azkapazka', // replace with what you used
  port: 5432,
});

module.exports = pool;
