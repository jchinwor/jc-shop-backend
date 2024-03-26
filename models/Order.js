const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//Create Order Schema
const OrderSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    cartItems: [{
            name: {type:String, required:true},
            quantity: {type:Number, required:true},
            new_price: {type:Number, required:true},
            imageUrl: {type:String, required:true},
            id:{
                type: Number,
                required: true,
                
            }
        }],
    shippingAddress:{
       firstname:{ type:String, required: true},
       lastname:{ type:String, required: true},
       address:{ type:String, required: true},
       city:{ type:String, required: true},
       country:{ type:String, required: true},
       phonenumber:{ type:String, required: true},
       email:{ type:String, required: true},
    },
    paymentMethod:{
        type: String,
        required: true
    },
    paymentResult:{ 
        id: {type: String}, 
        status: {type: String}, 
        update_time: {type: String}, 
        email_address: {type: String}, 
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice:{
        type: Number,
        required: true,
        deafault: 0.0
    },
    totalPrice:{
        type: Number,
        required: true,
        deafult: 0.0
    },
    isPaid:{
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    } 
    
       
},{
    timestamps: true
})
 
const Order = mongoose.model('orders', OrderSchema);

module.exports = Order;