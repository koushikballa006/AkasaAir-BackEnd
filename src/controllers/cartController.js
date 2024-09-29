const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { generateOrderID } = require('../utils/helpers');

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if requested quantity is available in stock
    if (quantity > product.inStock) {
      return res.status(400).json({ 
        message: 'Requested quantity exceeds available stock',
        availableStock: product.inStock
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex > -1) {
      // Check if the new total quantity exceeds the available stock
      const newTotalQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newTotalQuantity > product.inStock) {
        return res.status(400).json({ 
          message: 'Total requested quantity exceeds available stock',
          availableStock: product.inStock,
          currentCartQuantity: cart.items[existingItemIndex].quantity
        });
      }
      cart.items[existingItemIndex].quantity = newTotalQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    let totalAmount = 0;
    const cartItems = cart.items.map(item => {
      const itemTotal = item.quantity * item.product.price;
      totalAmount += itemTotal;
      return {
        product: item.product,
        quantity: item.quantity,
        itemTotal
      };
    });

    res.status(200).json({
      items: cartItems,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const outOfStockItems = [];
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        outOfStockItems.push(`Product ${item.product._id} not found`);
      } else if (product.inStock < item.quantity) {
        outOfStockItems.push(`${product.name} - requested: ${item.quantity}, available: ${product.inStock}`);
      } else {
        orderItems.push({
          product: item.product._id,
          quantity: item.quantity,
          price: product.price
        });
        totalAmount += product.price * item.quantity;
      }
    }

    if (outOfStockItems.length > 0) {
      return res.status(400).json({ message: 'Some items are not available', outOfStockItems });
    }

    const orderID = generateOrderID();
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      orderID
    });

    await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inStock: -item.quantity }
      });
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: 'Order placed successfully',
      orderID,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during checkout', error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};