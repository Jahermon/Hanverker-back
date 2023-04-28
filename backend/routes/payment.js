const express = require('express')
const router = express.Router();

const { isAuthenticadedUser } = require('../middlewares/auth')

const {
  processPayment,
  sendStripApi
} = require('../controllers/paymentController')



router.route('/payment/process').post(isAuthenticadedUser,processPayment);
router.route('/stripeapi').get(isAuthenticadedUser, sendStripApi);

module.exports = router;