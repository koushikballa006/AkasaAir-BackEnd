const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    let query = {};
    if (category.toLowerCase() !== 'all') {
      query = { category: category };
    }
    const products = await Product.find(query);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error('Error in getProductsByCategory:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.addProduct = async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Trim whitespace from field names and values
    const cleanBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key.trim(), typeof value === 'string' ? value.trim() : value])
    );

    console.log('Cleaned body:', cleanBody);

    let imageData = {};
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log('Cloudinary result:', result);
      imageData = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    const product = await Product.create({
      name: cleanBody.name,
      description: cleanBody.description,
      category: cleanBody.category,
      price: cleanBody.price,
      inStock: cleanBody.inStock,
      image: imageData
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Error in addProduct:', err);
    res.status(400).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Error in getProduct:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const cleanBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key.trim(), typeof value === 'string' ? value.trim() : value])
    );

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      cleanBody.image = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    product = await Product.findByIdAndUpdate(req.params.id, cleanBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Error in updateProduct:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    if (product.image && product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }
    await product.remove();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error in deleteProduct:', err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};