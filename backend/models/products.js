const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor introduce el nombre del producto'],
    trim: true,
    maxLength: [100, 'El nombre del producto no puede exceder los 100 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'Por favor introduce el nombre del price'],
    maxLength: [5, 'El precio del producto no puede exceder 5 digitos'],
    default: 0.0
  },
  description: {
    type: String,
    required: [true, 'Por favor introduce la descripcion del producto'],
  },
  ratings: {
    type: Number,
    default: 0
  },
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
    }
  ],
  category: {
    type: String,
    required: [true, 'Por favor introduce la categoria del producto'],
    enum: {
      values: [
        'Pulseras',
        'Anillos',
        'Colgantes',
        'Ilustraciones',
        'Cuadros',
        'Ceramica',
        'Hogar',
        'Materiales',
        'Pendientes',
        'Otros'
      ],
      message: 'Por favor selecciona la categoria correcta del producto'
    }
  },
  seller: {
    type: String,
    required: [true, 'Por favor introduce un vendedor']
  },
  stock: {
    type: Number,
    required: [true, 'Por favor introduce ekl stock'],
    maxLength: [4, 'El stock del producto no puede exceder 4 digitos'],
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required:true
  },
  createdAt:{
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('product', productSchema)