//this is the main server, loads express, tells express to 
// accept json Input and to use routes defined in routes.js


const express = require('express');

const app = express();

app.use(express.json());

const inventoryRoutes = require('./routes/inventory');
app.use('/', inventoryRoutes);


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
