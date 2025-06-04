const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userController.signUpUser);
router.post('/login', userController.logInUser);
router.get('/forgotpassword/:email', userController.forgotUser);
router.get('/resetpassword/:uuid', userController.resetPassword);
router.post('/updatepassword/:uuid', userController.updatePassword);

module.exports = router;