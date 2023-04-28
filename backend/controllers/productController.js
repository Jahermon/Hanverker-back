const Product = require('../models/products')

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary')

// Create new product   =>   /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {

  
    let images = []

    //IF is one image push into the array, otherwise assing the array content into de array images
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
})

// get all products => /api/v1/products
exports.getProducts = catchAsyncErrors (async (req, res, next) => {

  const resPerPage = 4;
  const productsCount = await Product.countDocuments();



  const apiFeatures = new APIFeatures(Product.find(), req.query)
                      .search()
                      .filter()
                      

  let products = await apiFeatures.query;
  let filteredProductsCount = products.length

  apiFeatures.pagination(resPerPage);
  products = await apiFeatures.query.clone();
  //const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products
  })
})

// Get all products (Admin)  =>   /api/v1/admin/products
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {

  const products = await Product.find();

  res.status(200).json({
      success: true,
      products
  })

})

//get single product details => /api/v1/product/:id

exports.getSingleProduct = catchAsyncErrors (async (req, res, next) => {

  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorHandler('Producto no encontrado', 404))
  }

  res.status(200).json({
    success: true,
    product
  })

})

// update Product => /api/v1/admin/product/:id

exports.updateProduct = catchAsyncErrors (async (req, res, next) => {

  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Error al modificador los datos del producto', 404))
  }


  let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if (images !== undefined) {

        // Deleting images associated with the product
        for (let i = 0; i < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        let imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        req.body.images = imagesLinks

    }


  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true

  })

  res.status(200).json({
    success: true,
    product
  })

})

//delete Product => /api/v1/admin/product/:id

exports.deleteProduct = catchAsyncErrors  (async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorHandler('Error al borrar el producto en la base de datos', 404))
  }

 
  // Deleting images associated with the product
  for (let i = 0; i < product.images.length; i++) {
    const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
}

  await product.deleteOne()

  res.status(200).json({
    success: true,
    message: 'El producto ha sido eliminado de la base de datos'
  })
})

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

  const { rating, comment, productId } = req.body;

  const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
  }

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
  )

  if (isReviewed) {
      product.reviews.forEach(review => {
          if (review.user.toString() === req.user._id.toString()) {
              review.comment = comment;
              review.rating = rating;
          }
      })

  } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length
  }

  // Calculate the overall rating
  product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
      success: true
  })

})


// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
      success: true,
      reviews: product.reviews
  })
})

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

  const product = await Product.findById(req.query.productId);

  
  const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

  const numOfReviews = reviews.length;

  const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

  await Product.findByIdAndUpdate(req.query.productId, {
      reviews,
      ratings,
      numOfReviews
  }, {
      new: true,
      runValidators: true,
      useFindAndModify: false
  })

  res.status(200).json({
      success: true
  })
})