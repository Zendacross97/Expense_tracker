const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const user = jwt.verify(token, 'secret_key');
        User.findByPk(user.UserId)
        .then((res) => {
            req.user = res;
            next();
        })
    } catch(err) {
        console.log(err.message);
    }
}

module.exports = {
    authenticate
};