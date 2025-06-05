// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');  // Usar nombre claro para importar rutas

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API routes prefix
app.use('/api', apiRoutes);

module.exports = app;
