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

exports.stockIn = (req, res) => {
    const { productId, quantity } = req.body;
  
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).send({ error: 'Invalid input' });
    }
  
    const inventory = loadInventory();
  
    if (!inventory[productId]) {
      inventory[productId] = 0;
    }
  
    inventory[productId] += quantity;
  
    saveInventory(inventory);
  
    res.send({
      message: 'Stock updated',
      productId,
      currentQuantity: inventory[productId]
    });
  };
  
  
  exports.sell = (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
        return res.status(400).send({ error: 'Invalid input' });
      }

      const inventory = loadInventory();

      
      if (inventory[productId] === undefined) {
        return res.status(404).send({ error: 'Product not found' });
      }
      
      if (inventory[productId] < quantity) {
        return res.status(400).send({ error: 'Not enough stock' });
      }

      inventory[productId] -= quantity;
      saveInventory(inventory);

      res.send({
        message: 'Stock updated',
        productId,
        currentQuantity: inventory[productId]

      })
      

};
  
  exports.getInventory = (req, res) => {
    res.send({ message: 'Inventory data' });
  };
  