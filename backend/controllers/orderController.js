const Order = require('../models/order');
const Product = require('../models/products');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create a new order   =>  /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})


// Get single order   =>   /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) {
        return next(new ErrorHandler('No se encontró un pedido con este ID', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// Get logged in user orders   =>   /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })

    res.status(200).json({
        success: true,
        orders
    })
})


// Get all orders - ADMIN  =>   /api/v1/admin/orders/
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})


// Update / Process order - ADMIN  =>   /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Ya has entregado este pedido', 400))
    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status,
        order.deliveredAt = Date.now()

    await order.save()

    res.status(200).json({
        success: true,
    })
})


async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false })
}



// Delete order   =>   /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler('No Order found with this ID', 404))
    }

    await order.deleteOne()

    res.status(200).json({
        success: true
    })
})

/*
    {
    	"itemsPrice" : 2.75,
    	"taxPrice" : 0.14,
    	"shippingPrice" : 25,
    	"totalPrice" : 27.89,
    	"orderItems" : [
    		{
    			"product" : "5fbff4439d9ba8406833ea73",
    			"name" : "Kauffman Orchards Homegrown McIntosh Apples",
    			"price" : 2.75,
    			"image" : "https://res.cloudinary.com/shopit/image/upload/v1606293152/products/i0k1wdwi5hrpmzwxvsds.jpg",
    			"quantity" : 1
    		}
    	],
    	"shippingInfo" : {
    		"address" : "3951  Smith Street",
    		"city" : "New York",
    		"phoneNo" : 5555551234,
    		"postalCode" : 10001,
    		"country" : "United States"
    	},
    	"paymentInfo" : {
    		"id" : "pi_1HrMVNAlHMiRMt8E1BguvVIo",
    		"status": "succeeded"
    	}
    }

*/ 