import Watch from '../../models/product/watch.model.js';

// @desc    Get all watches
// @route   GET /api/products/watches
// @access  Public
export const getWatches = async (req, res) => {
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

    const watches = await Watch.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Watch.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products: watches,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get watches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watches',
      error: error.message,
    });
  }
};

// @desc    Get single watch
// @route   GET /api/products/watches/:id
// @access  Public
export const getWatchById = async (req, res) => {
  try {
    const watch = await Watch.findById(req.params.id);

    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Watch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: watch },
    });
  } catch (error) {
    console.error('Get watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watch',
      error: error.message,
    });
  }
};

// @desc    Create watch
// @route   POST /api/products/watches
// @access  Private/Admin
export const createWatch = async (req, res) => {
  try {
    const watch = await Watch.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Watch created successfully',
      data: { product: watch },
    });
  } catch (error) {
    console.error('Create watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating watch',
      error: error.message,
    });
  }
};

// @desc    Update watch
// @route   PUT /api/products/watches/:id
// @access  Private/Admin
export const updateWatch = async (req, res) => {
  try {
    const watch = await Watch.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Watch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watch updated successfully',
      data: { product: watch },
    });
  } catch (error) {
    console.error('Update watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating watch',
      error: error.message,
    });
  }
};

// @desc    Delete watch
// @route   DELETE /api/products/watches/:id
// @access  Private/Admin
export const deleteWatch = async (req, res) => {
  try {
    const watch = await Watch.findByIdAndDelete(req.params.id);

    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Watch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watch deleted successfully',
    });
  } catch (error) {
    console.error('Delete watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting watch',
      error: error.message,
    });
  }
};

