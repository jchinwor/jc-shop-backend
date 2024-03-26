const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

//Review Schema
const reviewSchema = new Schema({

    reviewTitle:{
        type: String,
        required: true 
    },
    name:{
        type: String,
        required: true 
    },
    averageRating:{
        type: Number,
        required:true,
    },
    comment:{
        type: String,
        required: true 
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
    } 
},{
    timestamps:true
})

//Create Prodcut Schema
const ProductSchema = new Schema({
    id:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true 
    },
    imageUrl: {
        type: String,
        required: true
        },
    reviews: [reviewSchema],
    category:{
        type: String,
        required: true
    },
    numReviews:{
        type: Number,
        require: true,
        default:0,
    },
    averageRating:{
        type: Number,
        required:true,
        default:0,
    }, 
    description:{
        type: String,
        required: true
    },
    new_price:{
        type: Number,
        required: true
    },
    old_price:{
        type: Number,
        required: true
    },
    countInStock:{
        type: Number,
        required: true,
        default:0,
    },
    available:{
        type: Boolean,
        default:true
    } 
    
       
},{
    timestamps: true
})
 
const Product = mongoose.model('products', ProductSchema);
module.exports = Product;