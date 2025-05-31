require('dotenv').config();

const express = require('express');
const errorController = require('./controllers/errorController');

const authRoutes = require('./routes/authRoutes');
const waterSourceRoutes = require('./routes/waterSourceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

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
app.use('/api/water-sources', waterSourceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

//los errores van despues 
app.use(errorController.notFoundHandler);
app.use(errorController.errorHandler);



app.listen(ports, () => console.log(`Escuchando el puerto ${ports}`));
