const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['Fruit', 'Vegetable', 'Non-veg', 'Bread', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  inStock: {
    type: Number,
    required: [true, 'Please add the number of items in stock'],
    min: [0, 'Stock cannot be negative']
  },
  image: {
    public_id: String,
    url: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);