const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//Create User Schema
const CategorySchema = new Schema({
    categoryImage:{
        type: String,
        required: true
    },
    categoryName:{
        type: String,
        required: true 
    },
    categoryDescription:{
        type: String,
        required: true 
    }    
},{
    timestamps: true
})
 
const Category = mongoose.model('categories', CategorySchema);

module.exports = Category;