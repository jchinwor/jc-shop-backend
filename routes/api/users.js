import express from "express";
import Product from "../../models/Product";
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../../models/User') 
const { check, validationResult } = require('express-validator');
const { validateUserLogin,validateUserSignup, userValidation } = require("../../middleware/validation/user");
const key = process.env.SECRET;


  
router.get('/', (req, res) =>{ 

    User.find({}).then(users => {
        
        if(users){
            
            return res.status(201).json(users)
        }else{

            return res.status(401).json("Users not found")
        }
    })
    // res.send('Yes the API works') 
})

/**
 * @route POST api/users/login
 * @desc Login the User
 * @access Public
 */

router.post('/login',validateUserLogin,userValidation,(req,res)=>{

    User.findOne({
        email: req.body.email
    }).then(user =>{  
        if(!user){ 

            return res.json({
                msg: "Email not found",
                success: false  
            })  
        } 

        // if there is user, compare password
        bcrypt.compare(req.body.password, user.password).then(isMatch =>{
            if(isMatch){
                //User's password is correct and we need to send the Json webtoken for that user
                const payload = {
                    _id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,    
                    email: user.email,
                }
                jwt.sign(payload,key, { expiresIn: 604800}, (err, token) =>{
                    res.status(200).json({
                        success: true,
                        user:user,
                        token: `Bearer ${token}`,
                        msg: "Hurray you are now logged in"
                    })
                }) 
            }else{ 

                return res.json({
                    msg: "Incorrect Username or Password",
                    success: false 
                })
            }
        })

    })
})






/**
 * @route GET api/users/:userId/cartItems
 * @desc Get cart data of User from MongoDB
 * @access Public
 */


router.get('/:userId/cartItems', async(req, res) =>{

    const { userId } = req.params
    const user = await User.findOne({ _id: userId })


    if(!user){

        return res.status(404).json('Could not find user')

    }

    if(user){

        res.json({
            CartItems: user.cartItems
        })
        
      

    }
 
   
    // const UserCartItems = user.cartItems;
    
    // res.status(200).json(UserCartItems);
       
})






/**
 * @route Post api/users/:userId/cartItems
 * @desc Update cart data in MongoDB after User Login
 * @access Public
 */


router.post('/:userId/cartItems', async(req, res) =>{

    const { userId } = req.params
    const { cartitemsvalue } = req.body
    const user = await User.findOne({ _id: userId })


    if(!user){

        return res.status(404).json('Could not find user')

    }

    if(user){


        for( var i = 0; i < cartitemsvalue.length;i++){

            // console.log(cartitemsvalue[i].id)


            const check = user.cartItems.find((cartitem) => cartitem.id === cartitemsvalue[i].id );

            if(check){
    
    
                const quantitydata = check.quantity + cartitemsvalue[i].quantity;
    
               
    
                const updatedUserCart = await User.updateOne(
                    { _id: userId, "cartItems.id": cartitemsvalue[i].id },
                    {
                        $set: {
                            "cartItems.$.quantity": quantitydata,
                         }
                    }
                )
    
                if(updatedUserCart){

                    await user.save()

                    // await User.findOne({ _id: userId })
    
                    // res.status(200).json({
                    //     msg: "Cart Item Updated from Local to Mongodb",
                        
                    // })
    
                    
    
                }
    
            }else{

                cartitemsvalue[i].quantity = 1;

                const addproducttocart = await User.updateOne({  _id : userId },{
                    $addToSet:{ cartItems : cartitemsvalue[i]}
                });

                if(addproducttocart){

                    // res.json({
                    //     msg: "product(s) added to user cart"
                    // })
                    console.log("No cart item matched with that ID and Items added to array")
                }
    
               
            }


            
        }

        
      

    }
 
   
    // const UserCartItems = user.cartItems;
    
    // res.status(200).json(UserCartItems);
       
})





/**
 * @route Post api/users/:userId/cart
 * @desc Add product to User cart
 * @access Public
 */


router.post('/:userId/cart', async (req,res)=>{

    const { productId,product } = req.body
    const { userId } = req.params

    const user = await User.findOne({ _id: userId });
    if(user){

        
        const check = user.cartItems.find((user) => user.id === productId);

        if(check){


            const quantitydata = check.quantity +=1;

            // console.log(check1)

            const addquantity = await User.updateOne(
                { _id: userId, "cartItems.id": productId },
                {
                    $set: {
                        "cartItems.$.quantity": quantitydata,
                     }
                }
            )

            if(addquantity){

                res.status(200).json({
                    msg: "product quantity updated"
                })

            }

        }else{

            product.quantity = 1;

            const addproducttocart = await User.updateOne({  _id : userId },{
                $addToSet:{ cartItems : product}
            });

            if(addproducttocart){

                res.status(200).json({
                    msg: "product added to user cart"
                })
            }
        

        }

        

    }

    
 
} )



/**
 * @route Post api/users/:userId/removeCartItem
 * @desc Remove product from cart
 * @access Public
 */


router.post('/:userId/removeCartItem', async (req,res)=>{

    const { productId } = req.body
    const { userId } = req.params

    const user = await User.findOne({ _id: userId });
    if(user){

        
        const check = user.cartItems.find((cartitem) => cartitem.id === productId && cartitem.quantity>1);

        if(check){


            const reducequantitydata = check.quantity -=1;

           

            const reducequantity = await User.updateOne(
                { _id: userId, "cartItems.id": productId },
                {
                    $set: {
                        "cartItems.$.quantity": reducequantitydata,
                     }
                }
            )

            if(reducequantity){

                res.status(200).json({
                    msg: "cart quantity updated"
                })

                

            }

        }else{

            const DeleteCartItem = await User.findByIdAndUpdate(userId,
                {
                   $pull: {
                    cartItems: {
                        id: productId
                      },
                   }
                },
                { new : true }
             );

             if(DeleteCartItem){
                
                res.status(200).json({
                    msg:"Cart item deleted from cart"
                })
             }

            

        }

        

    }else{
        console.log("No user")
    }

    
 
} )


/**
 * @route Delete api/users/:userId/cart/:productId
 * @desc Delete product in cart
 * @access Public 
 */ 


router.post('/:userId/deleteCartItem', async (req,res)=>{

    const { userId } = req.params
    const { productId } = req.body
     

    const DeleteCartItem = await User.findByIdAndUpdate(userId,
        {
           $pull: {
            cartItems: {
                id: productId
              },
           }
        },
        { new : true }
     );

     if(DeleteCartItem){

      
        
        res.status(200).json({
            msg:"Cart item deleted from cart"
        })
     }
   
    

    

  }) 
  
/**  
 * @route POST api/users/register
 * @desc Register the User
 * @access Public
 */
router.post('/register',validateUserSignup,userValidation,async(req, res) =>{

    const emailExist = await User.findOne({
        email: req.body.email 
    })

    if(emailExist){
                  
        return res.status(400).json({
                success:false,
                msg: "Email is already registered. Did you forget your password"
            })
    }



    
    // let cart = {}; 

    // for(let i =0; i < 300; i++){
    //     cart[i] = 0
    // }
  
    

    // let {
    //     name,
    //     username,
    //     email,
    //     password,
    //     confirm_password  
        
    // } = req.body

    if(req.body.password !== req.body.confirm_password){

        return res.status(400).json({
            success:false,
            msg: "Password do not match"
        })
    }
    

    //The data is valid and now we can register the User
    let newUser = new User({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        password:req.body.password,  
        email:req.body.email,
       
        // cartItems:cart
    });

    //Hash Password
    bcrypt.genSalt(10, (err, salt) =>{
        bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if(err) throw err;
            newUser.password = hash; 
            newUser.save().then(user =>{
                return res.status(201).json({
                    success: true,
                    msg: "User is successfully registered."
                })
            })
        })
    })

})

/**
 * @route GET api/users/profile
 * @desc User profile
 * @access Public 
 */ 

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res)=>{
    
        return res.json({
            user: req.user
        })
}) 


/**
 * @route PUT api/users/editprofile
 * @desc Update profile
 * @access Public 
 */ 

router.put('/profile', passport.authenticate('jwt', { session: false }), async(req, res)=>{

       
        const user = await User.findById(req.user._id);

        if(user){
            

            user.firstname = req.body.firstname || user.firstname
            user.lastname = req.body.lastname || user.lastname

            const updatedUser = await user.save()

            res.json({
                success: true,
                updatedUser,
                _id: updatedUser._id,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                createdAt: updatedUser.createdAt
            })

        }else{
            res.json({
                msg:"User not found"
            })
        }
}) 



/**
 * @route PUT api/users/updatepassword
 * @desc Update User Password
 * @access Public 
 */ 

router.put('/updatepassword', passport.authenticate('jwt', { session: false }), async(req, res)=>{

       
    const user = await User.findById(req.user._id);


    if(user){
             // if there is user, compare password
        bcrypt.compare(req.body.password, user.password).then(isMatch =>{
            if(isMatch){
                //User's password is correct

                user.password = req.body.newpassword || user.password

                //Hash Password
                bcrypt.genSalt(10, (err, salt) =>{
                    bcrypt.hash(user.password, salt, (err, hash)=>{
                        if(err) throw err;
                        user.password = hash; 
                        user.save().then(user =>{
                            return res.json({
                                success: true,
                                msg: "Password is successfully updated."
                            })
                        })
                    })
                })

               
            }else{ 

                return res.status(401).json({
                    msg: "Incorrect Current Password",
                    success: false 
                })
            }
        })


        }else{
            res.json.status(401).json({
                msg:"User not found"
            })
        }
}) 




module.exports = router;