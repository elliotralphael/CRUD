// To pull the .env file in parent microservices folder
require('dotenv').config({ path: '../env/.env.dev' });
require('dotenv').config({ path: '../env/.env.cart' });
const express = require("express");
const cors = require('cors')
const app = express();
app.use(cors())

// to load images from computer
const fs = require('fs');


// If need static files
// app.use(express.static("client")); 

// Connect to mongoDB
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);
const { ObjectID } = require('mongodb');

const BUYER_DB = client.db('buyer')
const BUYER_CART = BUYER_DB.collection("cart");




////////////////////////
// Database Functions //
////////////////////////


// Status: TESTED
// get user cart data
async function retrieveCart(user_id) {
  try {
    // Need to keep create 'new ObjectID' to search against mongodb
    // Take note of the '_id'
    const query = { user_id: new ObjectID(user_id) };
    const BUYER_CART_data = await BUYER_CART.findOne(query);
    if (BUYER_CART_data){
      console.log(BUYER_CART_data);
      return BUYER_CART_data
    }else{
      return false
    }
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

// Status: TESTED
// TODO add user_data parameter
async function updateCart(uid, products_data) {

  try {
    // create a document to insert
    const filter = {user_id: new ObjectID(uid)}
    const updateDocument = {
      $set: {
        buyer_id: new ObjectID(uid),
        products: products_data,
        updated_at: new Date().getTime() 
      },
    }
    const result = await BUYER_CART.updateOne(filter, updateDocument, {upsert: true});
    if(result){
      console.log(`Your cart was placed with the cart ID: ${result.insertedId}`);
      return result
    }else{
      console.log(`The is an error placing your cart. Try again.`);
      return false
    }
    
  }finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}






////////////////////////
//     Endpoints      //
////////////////////////



// Status: TESTED
// GET cart data
app.get('/cart/:id', async function(req, res, next) {
  const user_id = req.params.id
  if (user_id){
    console.log("user ID: " + user_id)
    await retrieveCart(user_id).then(function (user_cart) {
      if (user_cart){
        res.send(user_cart)
      }else{
        res.status(404).send('Empty cart?')
        res.send(false)
      }
    })
    .catch(console.dir)
    
  }else{
    res.send('Invalid cart ID!')
  }
});

// Status: TESTED
//  CREATE new cart
app.put('/cart/update', async function(req, res){
  if (req.body){
    // make sure req.body is a dict
    await updateCart(req.body).then(function (user_cart) {
      if (user_cart){
        res.status(200)
        res.send(user_cart) // cart ID
      }else{
        res.status(400)
        res.send(false)
      }
    })
    .catch(console.dir);
    
  }else{
    res.send('Request body missing')
  }
})


// // Status: NOT TESTED
// // TODO need to add/set permission for delete feature
// app.delete('/user/:id', (req, res) => {
//   if (req.params.id){
//     deleteUser(req.params.id).catch(console.dir);
//   }else{
//     res.send('edit BODY missing')
//   }
// })


app.listen(process.env.PORT, process.env.HOST, () => {
	console.log("Up and running! -- This is our cart service")
})
