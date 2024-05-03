const { check, validationResult } = require('express-validator');

exports.validateUserSignup = [
    check('firstname')
    .trim()
    .not()
    .isEmpty()
    .withMessage("Firstname is required ")
    .isAlpha()
    .withMessage('Firstname must be a valid name')
    .isLength({ min: 3, max:20})
    .withMessage('Firstname must be within 3 to 20 characters!'),
    check('lastname')
    .trim()
    .not()
    .isEmpty()
    .withMessage("Lastname is required ")
    .isAlpha() 
    .withMessage('Lastname must be a valid name')
    .isLength({ min: 3, max:20})
    .withMessage('Lastname must be within 3 to 20 characters!'),
    check('email','Invalid email').normalizeEmail().isEmail(),
    check('password','Password is required and must be within 3 to 20 characters!').exists().trim().isLength({ min: 8, max:20}),
    check('confirm_password').exists().trim().custom((value,{req})=>{

        if(value !== req.body.password){
            throw new Error('Both password must be same')
        }
        return true 
        
    })
]
exports.validateUserLogin = [
    check('email','Invalid email').normalizeEmail().isEmail(),
    check('password','Password is required and must be within 3 to 20 characters!').exists().trim().isLength({ min: 8, max:20}),
]

exports.userValidation = (req, res, next) =>{

    const result = validationResult(req).array();
    if(!result.length){

        return next()
    }

    const error = result[0].msg;
    res.status(400).json({
        success:false,
        msg:error
    })
   
}