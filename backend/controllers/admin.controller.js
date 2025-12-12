import User from '../models/User.js';
import Order from '../models/Order.js';
import Men from '../models/product/menModel.js';
import MenTshirt from '../models/product/menTshirt.model.js';
import Women from '../models/product/womenModel.js';
import Watch from '../models/product/watch.model.js';
import WatchNew from '../models/product/watchNew.model.js';
import Lens from '../models/product/lens.model.js';
import Accessory from '../models/product/accessory.model.js';
import Shoes from '../models/product/shoes.model.js';

const productModelMap = {
  men: Men,
  'men-tshirt': MenTshirt,
  'MenTshirt': MenTshirt,
  'Tshirts': MenTshirt,
  'Tshirt': MenTshirt,
  women: Women,
  watch: Watch,
  watches: Watch,
  'watch-new': WatchNew,
  'WATCH': WatchNew,
  'WATCHES': WatchNew,
  lens: Lens,
  lenses: Lens,
  accessory: Accessory,
  accessories: Accessory,
  shoes: Shoes,
  'Shoes': Shoes,
  'Shoe': Shoes,
};

const resolveProductModel = (category) => {
  if (!category) {
    throw new Error('Category is required');
  }
  // Check for exact match first (for WATCH/WATCHES)
  const exactMatch = productModelMap[category];
  if (exactMatch) {
    return exactMatch;
  }
  // Then check lowercase
  const key = category.toLowerCase();
  const model = productModelMap[key];
  if (!model) {
    throw new Error(`Unsupported category: ${category}`);
  }
  return model;
};

export const getDashboardSummary = async (req, res) => {
  try {
    // Count all documents in each collection (includes duplicates, multiple entries, etc.)
    // countDocuments() counts every document regardless of duplicates
    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      totalRevenue,
      menCount,
      womenCount,
      watchCount,
      watchNewCount,
      lensCount,
      accessoryCount,
      menTshirtCount,
      shoesCount,
    ] = await Promise.all([
      User.countDocuments(), // Count all user documents
      Order.countDocuments(), // Count all order documents
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Men.countDocuments(), // Count ALL men products (including duplicates)
      Women.countDocuments(), // Count ALL women products (including duplicates)
      Watch.countDocuments(), // Count ALL watch products (including duplicates)
      WatchNew.countDocuments().catch(() => 0), // Count ALL new watch products (including duplicates)
      Lens.countDocuments(), // Count ALL lens products (including duplicates)
      Accessory.countDocuments(), // Count ALL accessory products (including duplicates)
      MenTshirt.countDocuments().catch(() => 0), // Count ALL men t-shirt products (including duplicates)
      Shoes.countDocuments().catch(() => 0), // Count ALL shoes products (including duplicates)
    ]);

    // Calculate total products from all collections
    // This includes: duplicates, products in multiple collections, all variations
    // Each document is counted separately, so if a product appears 2x or 3x, it's counted 2x or 3x
    const totalProducts = menCount + womenCount + watchCount + watchNewCount + lensCount + accessoryCount + menTshirtCount + shoesCount;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts, // Total count of all products available on website
        inventory: {
          men: menCount,
          women: womenCount,
          watches: watchCount + watchNewCount, // Combined watch count (old + new schema)
          lens: lensCount,
          accessories: accessoryCount + shoesCount, // Combined accessories + shoes
          menTshirt: menTshirtCount, // New t-shirt collection
          shoes: shoesCount, // New shoes collection
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
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


