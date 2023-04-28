const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser
} = require('../controllers/authController')

const { isAuthenticadedUser, authorizeRoles } = require('../middlewares/auth')

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)

router.route('/logout').get(logout);

router.route('/me').get(isAuthenticadedUser, getUserProfile)
router.route('/password/update').put(isAuthenticadedUser, updatePassword)
router.route('/me/update').put(isAuthenticadedUser, updateProfile)

router.route('/admin/users').get(isAuthenticadedUser,authorizeRoles('admin'), allUsers)
router.route('/admin/user/:id')
      .get(isAuthenticadedUser,authorizeRoles('admin'), getUserDetails)
      .put(isAuthenticadedUser,authorizeRoles('admin'), updateUser)
      .delete(isAuthenticadedUser,authorizeRoles('admin'), deleteUser)



module.exports = router;