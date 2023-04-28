const express = require('express')
const router = express.Router();

const {
    newOrder,
    getSingleOrder,
    myOrders,
    allOrders,
    updateOrder,
    deleteOrder

} = require('../controllers/orderController')

const { isAuthenticadedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/order/new').post(isAuthenticadedUser, newOrder);

router.route('/order/:id').get(isAuthenticadedUser, getSingleOrder);
router.route('/orders/me').get(isAuthenticadedUser, myOrders);

router.route('/admin/orders/').get(isAuthenticadedUser, authorizeRoles('admin'), allOrders);

router.route('/admin/order/:id')
    .put(isAuthenticadedUser, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticadedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;