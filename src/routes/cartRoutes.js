const express = require('express');
const { addToCart, getCart, checkout } = require('../controllers/cartController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/add', auth, addToCart);
router.get('/', auth, getCart);
router.post('/checkout', auth, checkout);

module.exports = router;