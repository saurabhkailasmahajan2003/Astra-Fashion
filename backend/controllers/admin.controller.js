import User from '../models/User.js';
import Order from '../models/Order.js';
import Men from '../models/product/menModel.js';
import Women from '../models/product/womenModel.js';
import Watch from '../models/product/watch.model.js';
import Lens from '../models/product/lens.model.js';
import Accessory from '../models/product/accessory.model.js';

const productModelMap = {
  men: Men,
  women: Women,
  watch: Watch,
  watches: Watch,
  lens: Lens,
  lenses: Lens,
  accessory: Accessory,
  accessories: Accessory,
};

const resolveProductModel = (category) => {
  if (!category) {
    throw new Error('Category is required');
  }
  const key = category.toLowerCase();
  const model = productModelMap[key];
  if (!model) {
    throw new Error(`Unsupported category: ${category}`);
  }
  return model;
};

export const getDashboardSummary = async (req, res) => {
  try {
    const [totalUsers, totalOrders, pendingOrders, totalRevenue, menCount, womenCount, watchCount, lensCount, accessoryCount] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        Men.countDocuments(),
        Women.countDocuments(),
        Watch.countDocuments(),
        Lens.countDocuments(),
        Accessory.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        inventory: {
          men: menCount,
          women: womenCount,
          watches: watchCount,
          lens: lensCount,
          accessories: accessoryCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    order.deliveredDate = status === 'delivered' ? new Date() : order.deliveredDate;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message,
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message,
    });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const { category } = req.query;

    if (category) {
      const Model = resolveProductModel(category);
      const products = await Model.find().sort({ updatedAt: -1 }).limit(200);
      return res.status(200).json({
        success: true,
        data: { products },
      });
    }

    const [men, women, watches, lens, accessories] = await Promise.all([
      Men.find().limit(50),
      Women.find().limit(50),
      Watch.find().limit(50),
      Lens.find().limit(50),
      Accessory.find().limit(50),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products: [
          ...men.map((item) => ({ ...item.toObject(), category: 'men' })),
          ...women.map((item) => ({ ...item.toObject(), category: 'women' })),
          ...watches.map((item) => ({ ...item.toObject(), category: 'watches' })),
          ...lens.map((item) => ({ ...item.toObject(), category: 'lens' })),
          ...accessories.map((item) => ({ ...item.toObject(), category: 'accessories' })),
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { category, ...productData } = req.body;
    const Model = resolveProductModel(category);
    const product = await Model.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { category, ...productData } = req.body;
    const Model = resolveProductModel(category);
    const product = await Model.findByIdAndUpdate(req.params.id, productData, { new: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { category } = req.query;
    const Model = resolveProductModel(category);
    const product = await Model.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};


