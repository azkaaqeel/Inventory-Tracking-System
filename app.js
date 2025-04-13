//this is the main server, loads express, tells express to 
// accept json Input and to use routes defined in routes.js
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // <-- ADD THIS
const app = express();
//to protect API against request floods
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  message: 'Too many requests, please try again later.'
});
app.use(limiter); // apply to all routes

 // CORS middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));

app.use(express.json());

const inventoryRoutes = require('./routes/inventory');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
app.use('/', userRoutes); 

app.use('/auth', authRoutes);

app.use('/', inventoryRoutes);
app.use('/', userRoutes); 


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
