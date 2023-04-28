const express = require('express');
const router = express.Router()

const {
  getProducts,
  getAdminProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview
} = require('../controllers/productController')

const { isAuthenticadedUser, authorizeRoles } = require('../middlewares/auth')


router.route('/products').get(getProducts);
router.route('/admin/products').get(getAdminProducts);
router.route('/product/:id').get(getSingleProduct);

router.route('/admin/product/new').post(isAuthenticadedUser, authorizeRoles('admin'), newProduct);

router.route('/admin/product/:id')
  .put(isAuthenticadedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticadedUser, authorizeRoles('admin'), deleteProduct);


router.route('/review').put(isAuthenticadedUser, createProductReview)
router.route('/reviews').get(isAuthenticadedUser, getProductReviews)
router.route('/reviews').delete(isAuthenticadedUser, deleteReview)

module.exports = router