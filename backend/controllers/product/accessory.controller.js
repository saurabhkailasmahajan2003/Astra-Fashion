import Accessory from '../../models/product/accessory.model.js';

// @desc    Get all accessories
// @route   GET /api/products/accessories
// @access  Public
export const getAccessories = async (req, res) => {
  try {
    const {
      gender,
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

    if (gender) {
      query.gender = gender.toLowerCase();
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    if (isNewArrival === 'true') {
      query.isNewArrival = true;
    }

    if (onSale === 'true') {
      query.onSale = true;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const accessories = await Accessory.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Accessory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products: accessories,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get accessories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accessories',
      error: error.message,
    });
  }
};

// @desc    Get single accessory
// @route   GET /api/products/accessories/:id
// @access  Public
export const getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: accessory },
    });
  } catch (error) {
    console.error('Get accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accessory',
      error: error.message,
    });
  }
};

// @desc    Create accessory
// @route   POST /api/products/accessories
// @access  Private/Admin
export const createAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Accessory created successfully',
      data: { product: accessory },
    });
  } catch (error) {
    console.error('Create accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating accessory',
      error: error.message,
    });
  }
};

// @desc    Update accessory
// @route   PUT /api/products/accessories/:id
// @access  Private/Admin
export const updateAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Accessory updated successfully',
      data: { product: accessory },
    });
  } catch (error) {
    console.error('Update accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating accessory',
      error: error.message,
    });
  }
};

// @desc    Delete accessory
// @route   DELETE /api/products/accessories/:id
// @access  Private/Admin
export const deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findByIdAndDelete(req.params.id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Accessory deleted successfully',
    });
  } catch (error) {
    console.error('Delete accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting accessory',
      error: error.message,
    });
  }
};

