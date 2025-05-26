require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth');
const waterSourceRoutes = require('./routes/waterSource');
const errorController = require('./controllers/error');
const waterSourceAprovedRoutes = require('./routes/waterSource');



const app = express();
const ports = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth', authRoutes);
app.use('/water-sources', waterSourceRoutes);
app.use('/api/water-sources', waterSourceAprovedRoutes);

//los errores van despues 
app.use(errorController.notFoundHandler);
app.use(errorController.errorHandler);



app.listen(ports, () => console.log(`Escuchando el puerto ${ports}`));
