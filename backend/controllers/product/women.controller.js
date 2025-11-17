import Women from '../../models/product/womenModel.js';

// @desc    Get all women's products (shirts, tshirts, jeans, trousers)
// @route   GET /api/products/women
// @access  Public
export const getWomenItems = async (req, res) => {
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

    const items = await Women.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Women.countDocuments(query);

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
    console.error('Get women items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching women products',
      error: error.message,
    });
  }
};

// @desc    Get single women product
// @route   GET /api/products/women/:id
// @access  Public
export const getWomenItemById = async (req, res) => {
  try {
    const item = await Women.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Women product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: item },
    });
  } catch (error) {
    console.error('Get women item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching women product',
      error: error.message,
    });
  }
};


