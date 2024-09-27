const express = require('express');
const { getOrders, getOrderById, getOrderStatus } = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getOrders);
router.get('/:id', auth, getOrderById);
router.get('/status/:orderID', auth, getOrderStatus);

module.exports = router;