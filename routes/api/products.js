import express from "express";
const router = express.Router();
const Product = require('../../models/Product') 
const User = require('../../models/User') 
const jwt = require('jsonwebtoken');
const passport = require('passport');

import { admin } from "../../config/admin"

/**
 * @route Get api/products/
 * @desc Get all products
 * @access Public
 */

router.get('/',(req, res) =>{

    Product.find({}).then(products => {
        
        if(products){
            
            return res.status(200).json(products)
        }
    })
    // res.send('Yes the API works') 
})


/**
 * @route Get api/products/latest
 * @desc Get all latest products
 * @access Public
 */

router.get('/latest', async(req, res) =>{

    let product = await Product.find({}).limit(20).sort({$natural:-1})
    

   
        if(product){

            res.json(product)  
        }
        
})


/**
 * @route Get api/products/:id/review
 * @desc Product Review
 * @access Public
 */

router.post('/:productId/review', passport.authenticate('jwt', { session: false }), async(req, res) =>{

    
    const { productId } = req.params
    const { reviewTitle, averageRating, name, comment } = req.body

    const product = await Product.findOne({ _id: productId})

   
        if(product){

            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            )

            if(alreadyReviewed){

                res.json("Product Already Reviewed")
            }else{

                const review = {
                     reviewTitle,
                     name,
                    averageRating: Number(averageRating),
                    comment,
                    user: req.user._id,  
                };
                
                product.reviews.push(review)
                product.numReviews = product.reviews.length
                product.averageRating = product.reviews.reduce((acc,item) => item.averageRating + acc, 0) / 
                product.reviews.length;
    
                await product.save()
                res.json({
                    success:true,
                    msg: "Reviewed Added"
                })
            }

           
            
        }else{

            res.json("Product not found")
        }
        
})




/**
 * @route Post api/products/
 * @desc Add/Create Product
 * @access Public
 */

router.post('/addproduct', passport.authenticate('jwt', { session: false }),admin,async(req, res) =>{


    let products = await Product.find({});
    let id; 
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1  
    }else{ 
        id=1;  
    } 

    const productExist =  await Product.findOne({name:req.body.name})

    if(productExist){

        res.status(400).json("Product name already exists")

    }else{

        const product = new Product({
            id: id,
            name: req.body.name,
            imageUrl: req.body.imageUrl,
            category: req.body.category,
            countInStock:req.body.countInStock,
            description:  req.body.description,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
    
        })

        const  Savedproducts =  await  product.save()
    
        if(Savedproducts){

            const products = await Product.find({}).sort({$natural:-1})
            res.json({
                    success: true,
                    msg: "product is successfully added.",
                    products:products
                    
                })
        }

    }


    
    

    // res.send('Yes the API works') 
})


/**
 * @route Delete api/products/:productId
 * @desc Delete single product
 * @access Public
 */


router.post('/removeproduct', async (req, res) =>{
   
    const { productid } = req.body

    await Product.findOneAndDelete({ _id: productid});

   
            
        res.status(200).json({
            success:true,
        })

    
    // res.send('Yes the API works') 
})


   
/**
 * @route Delete api/categories/deleteselectedproduct
 * @desc Delete Selected Product(s)
 * @access Public
 */
router.post('/deleteselectedproduct',passport.authenticate('jwt', { session: false }),admin, async (req, res) =>{
   
    const { selectedproduct } = req.body
    
     if(selectedproduct){

        selectedproduct.forEach(async(product) => {

            await Product.findOneAndDelete({ _id: product._id});
     
        });

        res.json({
            success:true
        })
     }

})


/**
 * @route Put api/:productid/
 * @desc Update Product 
 * @access Private
 */

router.put('/:productid/', passport.authenticate('jwt', { session: false }),admin,async(req, res) =>{

    const { productid } = req.params

    const product = await Product.findOne({ id: productid })

    if(product){

        
            product.imageUrl = req.body.imageUrl,
            product.name = req.body.name,
            product.category = req.body.category,
            product.description = req.body.description,
            product.old_price = req.body.old_price,
            product.new_price = req.body.new_price,
            product.countInStock = req.body.countInStock
        

        

        const updateProduct = await product.save()

        if(updateProduct){

            const product = await Product.find({}).sort({$natural:-1})

            res.status(201).json({
                success:true,
                product:product
            })
        }


    }

})



router.get('/:productId', async (req, res) =>{
   
    const { productId } = req.params

    function isNumber(s)
    {
        for (let i = 0; i < s.length; i++)
            if (s[i] < '0' || s[i] > '9')
                return false;
  
        return true;
    }

    if (isNumber(productId)){


        const product = await Product.findOne({ id: productId});

        if(product){
                
            res.status(200).json(product)
    
        }else{
    
            res.status(404).json("Could not find the product")
        }

    }else{

        res.status(404).json("Could not find the product")
    }
    

   
    // res.send('Yes the API works') 
})
   





module.exports = router;