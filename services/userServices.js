const User = require('../models/userModel');
const ForgotPasswordRequests = require('../models/forgotPasswordRequests');

exports.getUserByEmail = async (email) => {
    try {
        return await User.findAll({
            where: { email: email },
        });     
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

exports.getUserByIdWithTransaction = async (userId, transaction) => {
    try {
        return await User.findAll({ //fetch the old total expense
            where: { id: userId },
            transaction
        });
    } catch (error) {
        throw new Error(`Error creating order: ${error.message}`);
    }
}

exports.getUserNameAndTotalExpense = async () => {
    try {
        return await User.findAll({
            attributes: ['name', 'totalExpense'],
            order: [['totalExpense', 'DESC']],
            limit: 5 // Fetch top 5 users by total expense
        });
    } catch (error) {
        console.error('Error fetching user name and total expense:', error);
    }
}

exports.updateUserPassword = async (password, UserId) => {
    try {
         return await User.update( //update the password
            { password: password },
            { where: { id: UserId } }
        );
    } catch (error) {
        console.error('Error updating user password:', error);
    }
}

exports.updateUserTotalExpenseByIdWithTransaction = async (newTotalExpense, UserId, transaction) => {
    try {
        return await User.update( //update the total expense
            { totalExpense: newTotalExpense },
            { where: { id: UserId }, transaction }
        );
    } catch (error) {
        console.error('Error updating user total expense:', error);
    }
}

exports.createUser = async (name, email, password) => {
    try {
        return await User.create({name, email, password});
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

exports.createUuid = async (uuid, userId) => {
    try {
        return await ForgotPasswordRequests.create({
            uuid: uuid,
            isactive: true,
            UserId: userId
        });
    } catch (error) {
        console.error('Error creating UUID:', error);
    }
}

exports.getUuid = async (uuid) => {
    try {
        return await ForgotPasswordRequests.findAll({
            where: { uuid: uuid, isactive: true },
        });
    } catch (error) {
        console.error('Error fetching UUID:', error);
    }
}

exports.updateUuidStatus = async (uuid) => {
    try {
        return await ForgotPasswordRequests.update(
            { isactive: false },
            { where: { uuid: uuid } }
        );
    } catch (error) {
        console.error('Error updating UUID:', error);
    }
}