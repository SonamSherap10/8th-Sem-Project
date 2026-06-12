const express = require('express');
const app = express();
const db = require('./model/index');

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


app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
