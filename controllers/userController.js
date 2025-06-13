const UserServices = require('../services/userServices');
const BrevoService = require('../services/brevoService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const signUpUser = async (req, res) => {  
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
             return res.status(400).json({ error: 'Sign-up credentials are incomplete' });
        }
        const userDetails = await UserServices.getUserByEmail(email); // Using the service to fetch user details
        // Check if user already exists
        if (userDetails.length !== 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        bcrypt.hash(password, 10, async (err, hash) => { // 10 is number of salt-rounds to generate strings of random salt along with password
            if (err) {
                return res.status(500).json({ error: 'Something went wrong' });
            }
            else {
                await UserServices.createUser(name, email, hash); // Using the service to create user
                res.status(201).json({ message: 'User created successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

function token(id) {
    return jwt.sign({ UserId: id }, 'secret_key')
}

const getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
};

const logInUser = async (req, res) => {  
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Login credentials are incomplete' });
        }
        // const userDetails = await User.findAll( { where: { email: email } } );
        const userDetails = await UserServices.getUserByEmail(email); // Using the service to fetch user details
        // Check if user exists
         if (userDetails.length === 0) {
            return res.status(404).json({ error: 'User not found' });
         }
         bcrypt.compare(password, userDetails[0].password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Something went wrong' });
            }
            else if (result === true) {
                res.status(200).json({ message: 'User login sucessful', token: token(userDetails[0].id) });
            }
            else {
                return res.status(401).json({ error: 'User not authorized'});
            }
         });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const getForgotPasswordPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/forgot.html'));
};

const forgotUser = async (req, res) => {
    try {
        const { email } = req.params;
        if(!email) {
            return res.status(400).json({ error: 'Email credential is incomplete'})
        }
        const uuid = uuidv4();
        const userId = await UserServices.getUserByEmail(email); // Using the service to fetch user details
        // Check if user exists
        if (userId.length === 0) {
            return res.status(404).json({ error: 'User not found' });
         }
        await UserServices.createUuid(uuid, userId[0].id); // Using the service to create UUID
        await BrevoService.sendResetPasswordEmail(email, uuid); // Using the service to send reset password email
        res.status(200).json({ message: 'Password reset link has been sent on your email' });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

const resetPassword = async (req, res) => {
    try {
        const { uuid } = req.params;
        const resetDetails = await UserServices.getUuid(uuid); // Using the service to fetch UUID details
        // Check if user exists
        if (resetDetails.length === 0) {
            return res.status(404).send('User not found');
         }
         res.status(200).sendFile(path.join(__dirname, '../views/resetPassword.html'));
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}

const updatePassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const { uuid } = req.params;
        if (!password || !confirmPassword) {
            return res.status(400).json({ error: 'Password credential is incomplete' });
        }
        if (password !== confirmPassword) { //confirm password
            return res.status(400).json({ error: 'Password and confirm password do not match' });
        }
        const resetDetails = await UserServices.getUuid(uuid); // Using the service to fetch UUID details
        // Check if user exists
        if (resetDetails.length === 0) {
            return res.status(404).json({ error: 'User not found' });
         }
         bcrypt.hash(password, 10, async (err, hash) => { //encrypt the password
            if (err) {
                return res.status(500).json({ error: 'Something went wrong' });
            }
            else {
                await UserServices.updateUserPassword(hash, resetDetails[0].UserId); // Using the service to update user password
                await UserServices.updateUuidStatus(uuid); // Using the service to update UUID status
                res.status(200).json({ message: 'Password updated successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

module.exports = {
    signUpUser,
    getLoginPage,
    logInUser,
    getForgotPasswordPage,
    forgotUser,
    resetPassword,
    updatePassword
};