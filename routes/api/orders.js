import express from "express";
const router = express.Router();
const Product = require('../../models/Product') 
const Order = require('../../models/Order') 
const User = require('../../models/User') 
const passport = require('passport');
const mongoose = require('mongoose')
import { admin } from "../../config/admin"
const jwt = require('jsonwebtoken');

const idAutoIncrement = require("id-auto-increment");


/**
 * @route Get api/orders/allorders
 * @desc Get all orders
 * @access Public
 */

router.get('/allorders',passport.authenticate('jwt', { session: false }),admin,(req, res) =>{

    Order.find({}).sort({ _id: -1 }).then(orders => {
        
        if(orders){

            return res.status(200).json({
                success:true,
                orders:orders
            })
        }
    })
    // res.send('Yes the API works') 
})




/**
 * @route Get api/orders/
 * @desc Get all customer orders
 * @access Public
 */

router.get('/', passport.authenticate('jwt', { session: false }), async(req, res) =>{

  
        const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });

            res.json(order)

}) 


/**
 * @route Get api/orders/
 * @desc Get all paid customer orders
 * @access Public
 */

router.get('/paidorders', passport.authenticate('jwt', { session: false }), async(req, res) =>{

  
    const orders = await Order.find({ user: req.user._id ,"isPaid": true}).sort({ _id: -1 });

        res.json(orders)

}) 




/**
 * @route Get api/orders/:id
 * @desc Get customer order by ID
 * @access Public
 */

router.get('/:orderid', passport.authenticate('jwt', { session: false }), async(req, res) =>{

    const { orderid } = req.params
    if(mongoose.Types.ObjectId.isValid(orderid)) {

        

        const order = await Order.findOne({ _id: orderid })
        if(order){

            res.status(201).json({
                success:true,
                order
            })
        
        }else{
    
            res.status(404).json({
                success:false,
                msg:"Order not found"
            })
        
        }
    }else{

        res.status(404).json({
            success:false,
            msg:"Order not found"
        })
    }
}) 


/**
 * @route Get api/orders/getCartItem/:productid
 * @desc Get customer order cart items by ID
 * @access Public
 */

router.get('/getCartItem/:productid', passport.authenticate('jwt', { session: false }), async(req, res) =>{

    const { productid } = req.params
    
    if(mongoose.Types.ObjectId.isValid(productid)) {

        
        const getOrderCartItem = await Product.findOne({ _id: productid })
        if(getOrderCartItem){


            res.status(201).json({
                success:true,
                getOrderCartItem:getOrderCartItem
            })
        
        }else{
    
            res.status(404).json({
                success:false,
                msg:"Order Cart Item not found"
            })
        
        }
    }else{

        res.status(404).json({
            success:false,
            msg:"Order Cart Item not found"
        })
    }
}) 


/**
 * @route Put api/orders/:id/pay
 * @desc Customer Order is Paid
 * @access Public
 */

router.put('/:orderid/pay',  async(req, res) =>{

    const { orderid } = req.params

    const order = await Order.findOne({ _id: orderid })

    if(order){
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {

            id:req.body.id,
            status:req.body.status,
            update_time:req.body.update_time,
            email_address:req.body.email_address,
        }

        const updateOrder = await order.save()

        if(updateOrder){

           const PaidCartItems =  updateOrder.cartItems

        //    console.log(PaidCartItems)


            PaidCartItems.forEach(async (item)=> {
            const product = await Product.findById(item._id);
            product.countInStock = product.countInStock - item.quantity;
            await product.save();
         })
         

            res.status(201).json({
                success:true,
                updateOrder
            
            })




        }

        


    }else{

        res.status(404).json("Order not found")
    }

    


}) 


/**
 * @route Put api/orders/:id/delivered
 * @desc Customer Order is Delivered
 * @access Public
 */

router.put('/:orderid/delivered', passport.authenticate('jwt', { session: false }),admin,async(req, res) =>{

    const { orderid } = req.params
    
    const order = await Order.findOne({ _id: orderid })

    if(order){
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    

        const updateOrder = await order.save()

        if(updateOrder){

            res.status(201).json({
                success:true,
                updateOrder
            
            })




        }

        


    }else{

        res.status(404).json("Order not found")
    }

    


}) 






/**
 * @route Post api/orders/
 * @desc Post customer order
 * @access Public
 */

router.post('/', async(req, res) =>{

    const { shippingAddress,orderItems,totalPrice,paymentMethod,userId,shippingPrice,taxPrice } = req.body


    const user = await User.findOne({ _id: userId })

   
    if(user.billingAddress.length){


            if(orderItems && orderItems.length === 0){

                res.status(400).json({
                    success:false,
                    msg: "No order items"
                })
             }else{


                const order = new Order({
                    user:userId,
                    cartItems:orderItems,
                    shippingAddress,
                    paymentMethod,
                    taxPrice,
                    shippingPrice,
                    totalPrice

                })

                const createOrder = await order.save()


                res.status(201).json({
                    success:true,
                    createOrder
                })
        }



    }else{

        const id = await idAutoIncrement();

            let BillingAddress = {
                id:id,
                firstname:shippingAddress.firstname,
                lastname:shippingAddress.lastname,
                email:shippingAddress.email,
                phonenumber: shippingAddress.phonenumber,
                city: shippingAddress.city,
                country: shippingAddress.country,
                address: shippingAddress.address
            }

            const addBillingAddressToUser = await User.updateOne({  _id : userId },{
                $addToSet:{ billingAddress:BillingAddress }
            });

       

        if(addBillingAddressToUser){

            const updateduser = await User.findOne({ _id: userId })

            const order = new Order({
                user:userId,
                cartItems:orderItems,
                shippingAddress,
                paymentMethod,
                taxPrice,
                shippingPrice,
                totalPrice


            })

            const createOrder = await order.save()

            res.status(201).json({
                success:true,
                user:updateduser,
                createOrder
            })

        }
       
      
        
    }

    

   

   
    // res.send('Yes the API works') 
})



module.exports = router;