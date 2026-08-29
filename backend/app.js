require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./model/index');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const authRoute = require('./route/authRoute');
const adminRoute = require('./route/adminRoute');
const retailerRoute = require('./route/retailerRoute');
const batchRoute = require('./route/batchRoute');
const orderRoute = require('./route/orderRoute');
const dispatchRoute = require('./route/dispatchRoute');
const invoiceRoute = require('./route/invoiceRoute');
const deliveryRoute = require('./route/deliveryRoute');
const paymentRoute = require('./route/paymentRoute');
const returnRoute = require('./route/returnRoute');
const productRoute = require('./route/productRoute');
const alertRoute = require('./route/alertRoute');

db.sequelize.sync({force : false}) 
const port = process.env.PORT || 7878;

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/retailers', retailerRoute);
app.use('/api/batches', batchRoute);
app.use('/api/orders', orderRoute);
app.use('/api/dispatch', dispatchRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/deliveries', deliveryRoute);
app.use('/api/payments', paymentRoute); 
app.use('/api/returns', returnRoute);
app.use('/api/alerts', alertRoute);
app.use('/api/products', productRoute);


app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
