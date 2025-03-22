import express from 'express';
import bodyParser from 'body-parser'
import { MongoClient, ServerApiVersion  } from 'mongodb'
import mongoose from 'mongoose';
import path from 'path';   
import multer from 'multer'; 
const sendEmail  = require("../middleware/emailService");
const passport = require('passport');
const jwt = require('jsonwebtoken');


require('dotenv').config();
const port = process.env.PORT;
const baseUrl = process.env.BASE_URL;

//CORS MIDDLE WARE
const cors = require('cors');
const app = express();
app.use(
  cors({
    origin: ["http://localhost:8080","https://jenkinschinwor.com","http://localhost:5173","https://jc-shop.onrender.com", "https://jc-shop-admin.onrender.com"]
  })
); 
 



//Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req,file,cb)=>{

    return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
   
const upload = multer({
  storage: storage
}) 

//Creating upload endpoint for images
app.post("/api/upload", upload.single('product'),(req,res)=>{

  res.json({
    success:1,
    image_url:`${baseUrl}/images/${req.file.filename}`
  })
})


//Middle Ware

//Form data middle ware
app.use(bodyParser.urlencoded({
  extended: false 
}))
app.use(bodyParser.json())
const uri = process.env.ATLAS_URI;






    
//Use Passport middleware
app.use(passport.initialize())
  
//Bring in passport strategy
require('../config/passport')(passport) 



// app.use('/images', express.static(path.join(__dirname, '../assets')));
app.use('/images', express.static('upload/images'));
// app.use(express.static(path.join(__dirname, 'public')));


//Bring in users route
const users = require('../routes/api/users')
app.use('/api/users', users)

//Bring in products route
const products = require('../routes/api/products')
app.use('/api/products', products)


//Bring in Category route
const categories = require('../routes/api/categories')
app.use('/api/categories', categories)

app.get('/', function(req,res){
  res.set('Content-Type', 'text/html; charset=utf-8');
}
//Bring in orders route
const orders = require('../routes/api/orders')
app.use('/api/orders', orders)

app.get('/api/config/paypal', (req,res) =>{

    res.json({
      clientID_paypal:process.env.PAYPAL_CLIENT_ID,
      clientID_paystack:process.env.PAYSTACK_CLIENT_ID,
    })
    // res.send(process.env.PAYPAL_CLIENT_ID)
})


// Email API Route
app.post("/send-email", async (req, res) => {
  const {email, subject, message } = req.body;

  if (!email || !subject || !message ) {
    return res.status(400).json({ success: false, message: "Invalid request body" });
  }

  const result = await sendEmail(email, subject, message);

  if (result.success) {
    return res.status(200).json({ success: true, message: "Thank you for contacting us, we will get back to you shortly", messageId: result.messageId });
  } else {
    return res.status(500).json({ success: false, message: "Email sending failed", error: result.error });
  }
});

//Get Products   

// app.get('/api/products', async (req,res)=>{

//     const client = await MongoClient.connect(
//         uri,
//         // { useNewUrlParser: true, useUnifiedTopology: true },
//     );

//     const db = client.db('jshop-db');
//     const products = await db.collection('products').find({}).toArray()

//       res.status(200).json(products);

//       client.close();
//   })


  // Get Cart products

//   app.get('/api/users/:userId/cart', async (req,res)=>{

//     const { userId } = req.params

//     const client = await MongoClient.connect(
//         uri,
        
//     );
 
//     const db = client.db('jshop-db');

//     const user = await db.collection('users').findOne({ id: userId })
//     if(!user){

//         return res.status(404).json('Could not find user')

//     }

    

//     const products = await db.collection('products').find({}).toArray();

//     const cartItemIds = user.cartItems;
//     const cartItems =  cartItemIds.map( id => products.find(product => product.id === id ))
//     res.status(200).json(cartItems);

      
//     client.close();

//   })

  // Get single product

//   app.get('/api/products/:productId',async (req,res)=>{

//         const { productId } = req.params

        
//     const client = await MongoClient.connect(
//         uri,
//         // { useNewUrlParser: true, useUnifiedTopology: true },
//     );

//         const db = client.db('jshop-db');

//         const product = await db.collection('products').findOne({ id: productId });
      

//         if(product){

//             res.status(200).json(product)

//         } else{

//             res.status(404).json("Could not find the product")
//         }

//         client.close();
//   })

  //Add Product to cart
//   app.post('/api/users/:userId/cart', async (req,res)=>{
 
//     const { productId } = req.body
//     const { userId } = req.params

//     const client = await MongoClient.connect(
//         uri,
//         // { useNewUrlParser: true, useUnifiedTopology: true },
//     ); 

//     const db = client.db('jshop-db');

//     await db.collection('users').updateOne({  id : userId },{
//         $addToSet:{ cartItems : productId}
//     });

//     const user = await db.collection('users').findOne({ id: userId });
//     const products = await db.collection('products').find({}).toArray();
//     const cartItemIds = user.cartItems;
//     const cartItems =  cartItemIds.map( id => products.find(product => product.id === id ))

//     res.status(200).json(cartItems)
    

//    client.close()
 

//   })

  //Delete products from cart
//   app.delete('/api/users/:userId/cart/:productId', async (req,res)=>{

//     const { userId, productId } = req.params
//     const client = await MongoClient.connect(
//         uri,
         
//     );
   
//     const db = client.db('jshop-db');

//     await db.collection('users').updateOne({  id : userId },{
//         $pull: { cartItems: productId },
//     });

//     const user = await db.collection('users').findOne({ id: userId });
//     const products = await db.collection('products').find({}).toArray();
//     const cartItemIds = user.cartItems;
//     const cartItems =  cartItemIds.map( id => products.find(product => product.id === id ))
//     res.status(200).json(cartItems);

//     client.close();

//   })


  // const client = new MongoClient(uri, {
  //   serverApi: {
  //     version: ServerApiVersion.v1,
  //     strict: true,
  //     deprecationErrors: true,
  //   } 
  // });
  // async function run() {
  //   try {
  //     // Connect the client to the server	(optional starting in v4.7)
  //     await client.connect();
  //     // Send a ping to confirm a successful connection
  //     await client.db("admin").command({ ping: 1 });
  //     console.log("Pinged your deployment. You successfully connected to MongoDB!");
  //   } finally {
  //     // Ensures that the client will close when you finish/error
  //     await client.close();
  //   }  
  // } 
  // run().catch(console.dir);

mongoose.connect(uri)

const connection = mongoose.connection;
connection.once('open', ()=>{
  console.log("Mongodb connection established")
})

app.listen(port, ()=>{
    console.log("Server is listening on port "+port)
}) 
