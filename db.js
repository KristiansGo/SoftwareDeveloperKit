const { Pool } = require('pg');

// Set up your PostgreSQL connection
const pool = new Pool({
  // your database configuration
});

const getProducts = async () => {
  // SQL query to get products from your database
  const query = 'SELECT * FROM products;';
  const client = await pool.connect();
  try {
    const res = await client.query(query);
    return res.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  getProducts, // Export the function so it can be used in other files like server.js
};
