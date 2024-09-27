const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('items.product');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this order' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderID: req.params.orderID, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.status(200).json({ success: true, status: order.status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};