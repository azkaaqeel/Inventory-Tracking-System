const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authenticateToken = require('../middleware/auth'); // protect routes

// Inventory APIs
router.post('/stock-in', authenticateToken, inventoryController.stockIn);
router.post('/sell', authenticateToken, inventoryController.sell);
router.post('/remove', authenticateToken, inventoryController.manualRemove);
router.get('/inventory', authenticateToken, inventoryController.getInventory);
router.get('/movements', authenticateToken, inventoryController.getStockMovements);

module.exports = router;
