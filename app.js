//this is the main server, loads express, tells express to 
// accept json Input and to use routes defined in routes.js

// 1. Import the express library
const express = require('express');

// 2. Create an Express app instance
const app = express();

// 3. Let the app understand JSON in requests
app.use(express.json());

// 4. Import your routes (you’ll write these in a moment)
const inventoryRoutes = require('./routes/inventory');
app.use('/', inventoryRoutes);

// 5. Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
