//logic will reside here

const NodeCache = require('node-cache');
const inventoryCache = new NodeCache({ stdTTL: 60 }); // 60 seconds TTL

const pool = require('../db'); //importing the db pool
const { error } = require('console');
const fs = require('fs');
const path = require('path');

const inventoryFile = path.join(__dirname, '../storage/inventory.json');

async function logStockMovement(store_id, product_id, quantity, type) {
  try {
    await pool.query(
      `INSERT INTO stock_movements (store_id, product_id, quantity, type)
       VALUES ($1, $2, $3, $4)`,
      [store_id, product_id, quantity, type]
    );
  } catch (err) {
    console.error('Logging failed:', err); 
  }
}

exports.stockIn = async (req, res) => {
  const { store_id, product_id, quantity } = req.body;

  if (!store_id || !product_id || !quantity || quantity < 1) {
    return res.status(400).send({ error: 'Invalid input' });
  }

  try {
    await pool.query(`
      INSERT INTO inventory (store_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (store_id, product_id)
      DO UPDATE SET quantity = inventory.quantity + $3,
                    updated_at = NOW()
    `, [store_id, product_id, quantity]);
    const cacheKey = `${store_id}-${product_id}`;
    inventoryCache.del(cacheKey);
    inventoryCache.del(`store-${store_id}`);

    res.send({
      message: 'Stock-in successful',
      store_id,
      product_id,
      quantity_added: quantity
    });

    logStockMovement(store_id, product_id, quantity, 'IN');

  } catch (err) {
    console.error('Error in stock-in:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
};

exports.sell = async (req, res) => {
  const { store_id, product_id, quantity } = req.body;

  if (!store_id || !product_id || !quantity || quantity < 1) {
    return res.status(400).send({ error: 'Invalid input' });
  }

  try {
    const result = await pool.query(
      'SELECT quantity FROM inventory WHERE store_id = $1 AND product_id = $2',
      [store_id, product_id]
    );
    if (result.rows.length === 0 || result.rows[0].quantity < quantity) {
      return res.status(400).send({ error: 'Not enough stock' });
    }
    await pool.query(
      `UPDATE inventory
       SET quantity = quantity - $1,
           updated_at = NOW()
       WHERE store_id = $2 AND product_id = $3`,
      [quantity, store_id, product_id]
    );
    const cacheKey = `${store_id}-${product_id}`;
    inventoryCache.del(cacheKey);
    inventoryCache.del(`store-${store_id}`);

    res.send({
      message: 'Sell successful',
      store_id,
      product_id,
      quantity_sold: quantity
    });

    logStockMovement(store_id, product_id, quantity, 'SELL');

  } catch (error) {
    console.error('Error in sell:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};

exports.manualRemove = async (req, res) => {
  const { store_id, product_id, quantity } = req.body;

  if (!store_id || !product_id || !quantity || quantity < 1) {
    return res.status(400).send({ error: 'Invalid input' });
  }

  try {
    const result = await pool.query('SELECT quantity FROM inventory WHERE store_id = $1 AND product_id = $2', [store_id, product_id]);
    if (result.rows.length === 0 || result.rows[0].quantity < quantity) {
      return res.status(400).send({ error: 'Not enough stock to remove' });
    }
    await pool.query(
      `UPDATE inventory
       SET quantity = quantity - $1,
           updated_at = NOW()
       WHERE store_id = $2 AND product_id = $3`,
      [quantity, store_id, product_id]
    );
    const cacheKey = `${store_id}-${product_id}`;
    inventoryCache.del(cacheKey);
    inventoryCache.del(`store-${store_id}`);

    res.send({
      message: 'Manual removal successful',
      store_id,
      product_id,
      quantity_removed: quantity
    });

    logStockMovement(store_id, product_id, quantity, 'REMOVE');

  } catch (err) {
    console.error('Error in manualRemove:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
};

exports.getInventory = async (req, res) => {
  const { store_id, product_id, start_date, end_date } = req.query;

  if (!store_id) {
    return res.status(400).send({ error: 'store_id is required' });
  }

  try {
    const cacheKey = product_id ? `${store_id}-${product_id}` : `store-${store_id}`;
    const cachedData = inventoryCache.get(cacheKey);

    if (cachedData) {
      return res.send(cachedData);
    }

    let baseQuery = `
      SELECT 
        i.store_id, 
        i.product_id, 
        p.name AS product_name,
        i.quantity, 
        i.updated_at
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.store_id = $1
    `;

    const params = [store_id];
    let paramIndex = 2;

    if (product_id) {
      baseQuery += ` AND i.product_id = $${paramIndex++}`;
      params.push(product_id);
    }

    if (start_date && end_date) {
      baseQuery += ` AND i.updated_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
      params.push(start_date, end_date);
    }

    const result = await pool.query(baseQuery, params);
    inventoryCache.set(cacheKey, result.rows);
    res.send(result.rows);
  } catch (err) {
    console.error('Error in getInventory:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
};
exports.getStockMovements = async (req, res) => {
  const {
    store_id,
    product_id,
    type,
    start_date,
    end_date,
    page = 1,
    limit = 20
  } = req.query;

  if (!store_id) {
    return res.status(400).send({ error: 'store_id is required' });
  }

  try {
    let baseQuery = `
      SELECT 
        sm.id,
        sm.store_id,
        s.name AS store_name,
        sm.product_id,
        p.name AS product_name,
        sm.type,
        sm.quantity,
        sm.timestamp
      FROM stock_movements sm
      JOIN stores s ON sm.store_id = s.id
      JOIN products p ON sm.product_id = p.id
      WHERE sm.store_id = $1
    `;

    const params = [store_id];
    let paramIndex = 2;

    if (product_id) {
      baseQuery += ` AND sm.product_id = $${paramIndex++}`;
      params.push(product_id);
    }

    if (type) {
      baseQuery += ` AND sm.type = $${paramIndex++}`;
      params.push(type);
    }

    if (start_date) {
      baseQuery += ` AND sm.timestamp >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      baseQuery += ` AND sm.timestamp <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` ORDER BY sm.timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await pool.query(baseQuery, params);
    res.send(result.rows);

  } catch (err) {
    console.error('Error fetching stock movements:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
};
