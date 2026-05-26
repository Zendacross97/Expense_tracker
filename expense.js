require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const userRoute = require('./routes/userRoutes');
const expenseRoute = require('./routes/expense_route');
const paymentRoute = require('./routes/paymentRoute');

const path = require('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const app = express();

app.use(cors());
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signUp.html'));
});
app.use('/user', userRoute);
app.use('/expense', expenseRoute);
app.use('/payment', paymentRoute);
app.use('/password', userRoute);

mongoose.connect('mongodb+srv://sidhchakraborty66:Tomal1997@cluster0.zjl8yge.mongodb.net/expense')
.then(res => {
    app.listen(process.env.PORT);
})
.catch(err => {
    console.log(err);
});