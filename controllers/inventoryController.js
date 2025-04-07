//logic will reside here

const pool = require('../db'); //importing the db pool


const { error } = require('console');
const fs = require('fs');
const path = require('path');

const inventoryFile = path.join(__dirname, '../storage/inventory.json');

function loadInventory() {
  if (!fs.existsSync(inventoryFile)) {
    return {};
  }

  const data = fs.readFileSync(inventoryFile, 'utf8');
  return data ? JSON.parse(data) : {};
}

function saveInventory(data) {
  fs.writeFileSync(inventoryFile, JSON.stringify(data, null, 2));
}

// using async because promise-based functions are being invoked (pool.query())
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

    await pool.query(`
      INSERT INTO stock_movements (store_id, product_id, quantity, type)
      VALUES ($1, $2, $3, $4)
    `, [store_id, product_id, quantity, 'IN']);

    res.send({
      message: 'Stock-in successful',
      store_id,
      product_id,
      quantity_added: quantity
    });

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
      await pool.query(
        `INSERT INTO stock_movements (store_id, product_id, quantity, type)
         VALUES ($1, $2, $3, $4)`,
        [store_id, product_id, quantity, 'SELL']
      );
      res.send({
        message: 'Sell successful',
        store_id,
        product_id,
        quantity_sold: quantity
      });
      
      
    } catch (error) {
      
    }
  };
      
    exports.manualRemove = async (req, res) => {
      const { store_id, product_id, quantity } = req.body;
    
      if (!store_id || !product_id || !quantity || quantity < 1) {
        return res.status(400).send({ error: 'Invalid input' });
      }
    
      try {
        const result = await pool.query('SELECT quantity FROM inventory WHERE store_id= $1 AND product_id =$2',[store_id, product_id])
        //prevents user from removing more than quantity existing in inventory
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
        await pool.query(
          `INSERT INTO stock_movements (store_id, product_id, quantity, type)
           VALUES ($1, $2, $3, $4)`,
          [store_id, product_id, quantity, 'REMOVE']
        );
        res.send({
          message: 'Manual removal successful',
          store_id,
          product_id,
          quantity_removed: quantity
        });
      
        
        
        
        
      } catch (err) {
        console.error('Error in manualRemove:', err);
        res.status(500).send({ error: 'Internal server error' });
      }
    };
    
      
    exports.getInventory = async (req, res) => {
      const { store_id, product_id } = req.query;
    
      if (!store_id) {
        return res.status(400).send({ error: 'store_id is required' });
      }
    
      try {
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
      
      if (product_id) {
        baseQuery += ' AND i.product_id = $2';
        params.push(product_id);
      }
      
      const result = await pool.query(baseQuery, params);
      res.send(result.rows);
            } catch (err) {
        console.error('Error in getInventory:', err);
        res.status(500).send({ error: 'Internal server error' });
      }
    };
    