const express = require('express');
const { 
  getProducts, 
  getProductsByCategory, 
  addProduct, 
  getProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(upload.single('image'), addProduct);

router.route('/category/:category').get(getProductsByCategory);

router.route('/:id')
  .get(getProduct)
  .put(upload.single('image'), updateProduct)
  .delete(deleteProduct);

module.exports = router;