const express = require('express');
const app =  express();

const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const dotenv = require('dotenv');
const cors = require('cors')
const errorMiddlerware = require('./middlewares/error')

// Setting up config file

const corsOptions = {
  origin: true,
  credentials: true
}

dotenv.config({ path: 'backend/config/config.env' })

app.use(cors(corsOptions))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true})); 
app.use(cookieParser())
app.use(fileUpload())


/*
app.use(express.json());
app.use(express.urlencoded({extended: true})); app.use(express.json()); 
app.use(cookieParser())
app.use(fileUpload())
*/

//import all routes

const products = require('./routes/product')
const auth = require('./routes/auth')
const payment = require('./routes/payment')
const order = require('./routes/order')

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', payment);
app.use('/api/v1', order);

// Middleware to handle errors
app.use(errorMiddlerware)

module.exports = app