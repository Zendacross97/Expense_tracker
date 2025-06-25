const Order = require('../models/orderModel');
const cashfreeService = require('../services/cashfreeService');
const path = require('path');

exports.createOrder = async (req, res) => {
    try {
        // Create a new order in your DB to get a unique orderId
        const order = await Order.create({ UserId: req.user.id });
        const orderId = order.id;

        // Creating the payment order with Cashfree
        const payment = await cashfreeService.createOrder(orderId);
        const paymentSessionId = payment.payment_session_id;
        const paymentOrderId = payment.order_id;

        // Updating the order in DB with the status and order ID
        await Order.update(
            { orderId: paymentOrderId, status: 'PENDING' },
            { where: { id: order.id } }
        );
        res.status(200).json({paymentSessionId});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.paymentStatus = async (req, res) => {
    try {
        const Id = req.params.Id;
        const orderDetails = await Order.findAll({ where: { id: Id } });
        const orderId = orderDetails[0].orderId;
        const orderStatus = await cashfreeService.getPaymentStatus(orderId);

        // Updating the order status in your DB
        await Order.update({ status: orderStatus }, { where: { id: Id } });

        // res.status(200).send(orderStatus);
        res.sendFile(path.join(__dirname, '../views/login.html'));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};