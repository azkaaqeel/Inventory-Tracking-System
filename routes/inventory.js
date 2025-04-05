const express = require('express');
const router = express.Router();

// Import the controller (you'll write this logic next)
const inventoryController = require('../controllers/inventoryController');

// Define API routes, 
//1st step: add route here of new api, then add logic in controller
router.post('/stock-in', inventoryController.stockIn);
router.post('/sell', inventoryController.sell);
router.get('/inventory', inventoryController.getInventory);

module.exports = router;
