const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//Create User Schema
const UserSchema = new Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true 
    },
    isAdmin: {
        type: Boolean,
        require: true,
        default: false,
    },
    // cartItems: [{ type: Array }],  
    cartItems: {
        type : Array , 
        "default" : [], 
        required: true
        },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    billingAddress:{
            type : Array , 
            "default" : [], 
            required: true   
    },
    date:{ 
        type: Date,
        Default: Date.now()  
    }, 
    
       
},{
    timestamps: true
})
 
const User = mongoose.model('users', UserSchema);

module.exports = User;