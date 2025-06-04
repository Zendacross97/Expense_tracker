require('dotenv').config();
const express = require('express');
const db = require('./util/db-connection');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const userRoute = require('./routes/userRoutes');
const expenseRoute = require('./routes/expense_route');
const paymentRoute = require('./routes/paymentRoute');
const indexModel = require('./models/expenseIndex');
const orderModel = require('./models/orderModel');
const userModel = require('./models/userModel');
const expenseModel = require('./models/expense_model');
const forgotPasswordModel = require('./models/forgotPasswordRequests');
const path = require('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

console.log(process.env.NODE_ENV);
const app = express();

app.use(cors());
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.static('public'));
app.use('/user', userRoute);
app.use('/expense', expenseRoute);
app.use('/payment', paymentRoute);
app.use('/password', userRoute);

db.sync({force: false})
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on http://localhost:3000");
    });
})
.catch((err) => {
    console.log(err);
});