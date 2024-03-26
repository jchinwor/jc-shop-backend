import express from "express";
import Category from "../../models/Category";
const router = express.Router();
const passport = require('passport');
import { admin } from "../../config/admin"


/**
 * @route Get api/categories/
 * @desc Get all categories
 * @access Public
 */

router.get('/',(req, res) =>{

    Category.find({}).then(categories => {
        
        if(categories){
            
            return res.status(200).json({
                success:true,
                categories
            })
        }
    })
    // res.send('Yes the API works') 
})


/**
 * @route Post api/categories/
 * @desc Add/Create Category
 * @access Private
 */

router.post('/addCategories', passport.authenticate('jwt', { session: false }),admin,async(req, res) =>{


    const categoryExist =  await Category.findOne({categoryName:req.body.categoryName})

    if(categoryExist){

        res.status(400).json("Category name already exists")

    }else{

        const category = new Category({

            categoryName: req.body.categoryName,
            categoryImage: req.body.imageUrl,
            categoryDescription: req.body.categoryDescription,
    
        })

        const Newcategory =  await  category.save()
    
        if(Newcategory){

            const category = await Category.find({})
            res.json({
                    success: true,
                    msg: "category is successfully added.",
                    categories:category
                    
                    
                })
        }

    }

})


/**
 * @route Put api/:categoryid/
 * @desc Update Category 
 * @access Private
 */

router.put('/:categoryid/', passport.authenticate('jwt', { session: false }),admin,async(req, res) =>{

    const { categoryid } = req.params

    const category = await Category.findOne({ _id: categoryid })

    if(category){

        category.categoryImage = req.body.imageUrl
        category.categoryName = req.body.categoryName
        category.categoryDescription = req.body.categoryDescription

        const updateCategory = await category.save()

        if(updateCategory){

            const category = await Category.find({})

            res.status(201).json({
                success:true,
                category:category
            })
        }


    }

})


/**
 * @route Delete api/categories/deletecategory
 * @desc Delete single category
 * @access Public
 */


router.post('/deletecategory',passport.authenticate('jwt', { session: false }),admin, async (req, res) =>{
   
    const { categoryid } = req.body

   

    const category = await Category.findOneAndDelete({ _id: categoryid});

   
            if(category){

                res.status(200).json({
                    success:true,
                    
                })
            }
        

    
    // res.send('Yes the API works') 
})


/**
 * @route Delete api/categories/deleteselectedcategory
 * @desc Delete Selected category
 * @access Public
 */


router.post('/deleteselectedcategory',passport.authenticate('jwt', { session: false }),admin, async (req, res) =>{
   
    const { selectedcategory } = req.body
    

     if(selectedcategory){

        selectedcategory.forEach(async(category) => {

            await Category.findOneAndDelete({ _id: category._id});
     
        });

        res.json({
            success:true
        })
     }

   



   


})

module.exports = router;