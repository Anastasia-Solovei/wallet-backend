const Categories = require('../repository/categoriesRepository');
const { HttpCode } = require('../config/constants');

// get all categories of transaction
const getAllCategories = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const categories = await Categories.getAllCategories({
      ...req.body,
      owner: userId,
    });

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.OK,
      data: { categories: categories },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
};
