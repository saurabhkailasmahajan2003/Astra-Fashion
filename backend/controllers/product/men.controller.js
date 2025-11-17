import Men from '../../models/product/menModel.js';

// @desc    Get all men's products (shirts, tshirts, jeans, trousers)
// @route   GET /api/products/men
// @access  Public
export const getMenItems = async (req, res) => {
  try {
    const {
      subCategory,
      isNewArrival,
      onSale,
      isFeatured,
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (subCategory) {
      const normalizedSubCategory = subCategory.toLowerCase().trim().replace(/-/g, '');
      query.subCategory = { $regex: new RegExp(`^${normalizedSubCategory}$`, 'i') };
    }

    if (isNewArrival === 'true') query.isNewArrival = true;
    if (onSale === 'true') query.onSale = true;
    if (isFeatured === 'true') query.isFeatured = true;

    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const items = await Men.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Men.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products: items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get men items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching men products',
      error: error.message,
    });
  }
};

// @desc    Get single men product
// @route   GET /api/products/men/:id
// @access  Public
export const getMenItemById = async (req, res) => {
  try {
    const item = await Men.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Men product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: item },
    });
  } catch (error) {
    console.error('Get men item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching men product',
      error: error.message,
    });
  }
};

// NOTE: Admin create/update/delete are optional; you can wire them later if needed.


