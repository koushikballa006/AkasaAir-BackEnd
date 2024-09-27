const express = require('express');
const { addToCart, getCart, checkout, removeFromCart } = require('../controllers/cartController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/add', auth, addToCart);
router.get('/', auth, getCart);
router.post('/checkout', auth, checkout);
router.delete('/:productId', auth, removeFromCart);

module.exports = router;