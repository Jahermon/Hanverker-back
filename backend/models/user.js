const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor introduce tu nombre'],
    maxLength: [60, 'Tu nombre no puede exceder los 60 carecteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor introduce tu correo'],
    unique: true,
    validate: [validator.isEmail, 'Por favor introduce un correo valido']
  },

  password: {
    type: String,
    required: [true, 'Por favor introduce tu contraseña'],
    minlength: [6, 'Tu contraseña debe ser contener al menos 6 caracteres'],
    select: false
  },

  avatar: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  role: {
    type: String,
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date

})

// Encrypting password before saving user

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  this.password = await bcrypt.hash(this.password, 10)
})

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Return JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  });
}

// generate password reset token 
userSchema.methods.getResetPasswordToken = function () {
  
  // generate token 
  const resetToken = crypto.randomBytes(20).toString('hex');

  // hash and set to resetPasswordToken
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  //set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

  return resetToken
}

module.exports = mongoose.model('User', userSchema);