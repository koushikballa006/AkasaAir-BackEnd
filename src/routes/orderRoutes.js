const express = require('express');
const { getOrders, getOrderById } = require('../controllers/orderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getOrders);
router.get('/:id', auth, getOrderById);

module.exports = router;