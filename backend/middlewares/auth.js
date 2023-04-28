const User = require('../models/user');

const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("./catchAsyncErrors")
const jwt = require("jsonwebtoken")

// Checks if user is authenticaded or not
exports.isAuthenticadedUser = catchAsyncErrors(async (req, res, next) => {

  const { token } = req.cookies

  if (!token) {
    return next(new ErrorHandler('Inicia Sesión para acceder al contenido', 401))
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id)

  next()
})

// handling users roles

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`El rol de (${req.user.role}) no tiene permitido el acceso al recurso`, 403))
    }

    next()
  }
}

