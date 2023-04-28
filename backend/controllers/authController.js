const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
const cloudinary = require('cloudinary');


// Registrer a user => /api/v1/register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {

  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'avatars',
    width: 150,
    crop: "scale"
  })

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url
    }
  })

  sendToken(user, 200, res)
})

//Login User => /api/v1/login

exports.loginUser = catchAsyncErrors(async (req, res, next) => {

  const { email, password } = req.body;

  // Checks if email and password is entered by user

  if (!email || !password) {
    return next(new ErrorHandler('Por favor introduce el correo y la contraseña', 400))

  }

  // Finding user in database
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorHandler('Correo o contraseña Inválidos', 401))
  }

  //Cheks if password in corretc or not
  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Correo o contraseña Inválidos', 401))
  }

  sendToken(user, 200, res)

})

// Forgor password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('Usuario no encontrado con este email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset password url

  //FOR DEPLOY WE NEED CHANGE THAT
  const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

  const message = `Tienes 30 minutos para restablecer su contrasela con el siguiente link:\n\n${resetUrl}\n\nSi no has solicitado este correo electrónico, ignóralo.`

  try {

    await sendEmail({
      email: user.email,
      subject: 'HandVerker Reestablecer Contraseña',
      message
    })

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`
    })

  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500))
  }

})

// reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

  // Hash URL token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(new ErrorHandler('El link para restablecer la contraseña ha expirado o se ha usado.', 400))
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('La contraseña no coincide', 400))
  }

  // Setup new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res)

})

// get currently loged in user details ¡: api/v1/me

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    user
  })
})

// Updated / change password => /api/v1/password/update

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findById(req.user.id).select('+password');

  // check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword)

  if (!isMatched) {
    console.log(req.body.oldPassword)
    return next(new ErrorHandler('La contraseña previa es incorrecta', 404))
  }

  user.password = req.body.password
  await user.save();

  sendToken(user, 200, res)

})


// Update User Profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email
  }

  // Update Avatar  

  if (req.body.avatar !== '') {
    const user = await User.findById(req.user.id)

    const image_id = user.avatar.public_id;
    const res = await cloudinary.v2.uploader.destroy(image_id)

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: "scale"
    })

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,

  })
})


// logout user  => /api/v1/logout

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    messagge: 'Sesión cerrada'
  })
})

// --- ADMIN ROUTES --- //

// Get all Users    => api/v1/admin/users

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users
  })

})

//Get user details    => /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`No se ha enontrado el usuario con esta ID: ${req.params.id} `))
  }

  res.status(200).json({
    success: true,
    user
  })
})

// Update User Profile => /api/v1/admin/user/id:
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }



  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,

  })
})

// Delete User => /api/v1/admin/user/id:
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`No se ha enontrado el usuario con esta ID: ${req.params.id} `))
  }

  //Remove Avatar from Cloudinary 
  const image_id = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(image_id)

  await user.deleteOne();

  res.status(200).json({
    success: true,
    messagge: `El Usuario con la ID: ${req.params.id}`
  })
})





