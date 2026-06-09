const express = require('express');
const app = express();
const db = require('./model/index');

const authRoute = require('./route/authRoute');

db.sequelize.sync({force : false}) 
const port = process.env.PORT || 7878;

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoute);


app.listen(port, () => {
    console.log('Server is running on port ' + port);
});