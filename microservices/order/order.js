// To pull the .env file in parent microservices folder
require('dotenv').config({ path: '../env/.env.dev' });
require('dotenv').config({ path: '../env/.env.order' });
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
const { ObjectId } = require('mongodb');

const ORDER_DB = client.db('order')
const ACTIVE_ORDER = ORDER_DB.collection("active");
const COMPLETE_ORDER = ORDER_DB.collection("completed");




////////////////////////
// Database Functions //
////////////////////////


// Status: TESTED
// search user function
async function searchOrder(order_id) {
  try {
    // Need to keep create 'new ObjectId' to search against mongodb
    // Take note of the '_id'
    const query = { _id: new ObjectId(order_id) };
    const BUYER_ORDERS_data = await ACTIVE_ORDER.findOne(query);
    if (BUYER_ORDERS_data){
      console.log(BUYER_ORDERS_data);
      return BUYER_ORDERS_data
    }else{
      return false
    }
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


// Status: TESTED
// search user function
async function searchBuyerOrders(buyer_id) {
  try {
    // Need to keep create 'new ObjectId' to search against mongodb
    // Take note of the '_id'
    const query = { buyer_id: new ObjectId(buyer_id) };
    const cursor = await ACTIVE_ORDER.find(query).sort( { created_at: 1 } );
    // store return doc 
    var buyer_active_orders = []
    for await (const doc of cursor) {
      console.log(doc);
      buyer_active_orders.push(doc)
    }
    
    if (buyer_active_orders.length >= 1){
      console.log(buyer_active_orders);
      return buyer_active_orders
    }else{
      return false
    }
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

// Status: TESTED
// search user function
async function searchBuyerCompletedOrders(buyer_id) {
  try {
    // Need to keep create 'new ObjectId' to search against mongodb
    // Take note of the '_id'
    const query = { buyer_id: new ObjectId(buyer_id) };
    const cursor = await COMPLETE_ORDER.find(query).sort( { created_at: 1 } );
    // store return doc 
    var buyer_completed_orders = []
    for await (const doc of cursor) {
      console.log(doc);
      buyer_completed_orders.push(doc)
    }
    
    if (buyer_completed_orders.length >= 1){
      console.log(buyer_completed_orders);
      return buyer_completed_orders
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
async function createOrder(order_data) {

  try {
    // create a document to insert
    const doc = {
      buyer_id: order_data.uid,
      address: order_data.address,
      status: {
        current: "Order Placed",
        history: {
          order_placed: {
            text: "Order has been successfully placed. Awaiting for Seller to accept order.",
            timestamp: new Date().getTime()
          }
        }
      },
      products: order_data.products,
      created_at: new Date().getTime(),
      updated_at: new Date().getTime() 
    }
    const result = await ACTIVE_ORDER.insertOne(doc);
    if(result){
      console.log(`Your order was placed with the Order ID: ${result.insertedId}`);
      return result.insertedId
    }else{
      console.log(`The is an error placing your order. Try again.`);
      return false
    }
    
  }finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

// Status: NOT TESTED
// TODO add the parameter
async function editOrderAddress(update_data) {

  try {
    const updateDocument = {
      $set: {
        address: update_address,
        updated_at: new Date().getTime()
      },
    }

    const filter = { _id: new ObjectId(update_data.oid) };

    const result = await ACTIVE_ORDER.updateOne(filter, updateDocument);
    if (result){
      console.log(`Order address has been updated!: ${result}`);
      return result
    }else{
      console.log(`Update address failed`);
      return false
    }
  }finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


// Status: NOT TESTED
// 
async function updateOrderStatus(update_data) {

  try {
    const query_dynamic = {}
    query_dynamic["status.history." + update_data.new_status] = update_data.new_status_data
    // Example of data to be inside ^^^^
    // e.g. update_data.new_status -> "seller_dispatch"
    // e.g. update_data.new_status_data -> 
        // {text: "Seller has sent parcel out for delivery",
        //   timestamp: new Date().getTime(),
        //   current: "Seller Dispatch"}


    const updateDocument = {
      $addFields: query_dynamic,
      $set: {
        "status.current": update_data.new_status_data.current,
        updated_at: new Date().getTime()
      }
    }

    const filter = { _id: new ObjectId(update_data.oid) };

    const result = await ACTIVE_ORDER.updateOne(filter, updateDocument);
    if (result){
      console.log(`Order status has been updated!: ${result}`);
      return result
    }else{
      console.log(`Update status failed`);
      return false
    }
  }finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


// // Status: NOT TESTED
// // Delete user
// async function deleteUser(user_id) {

//   try {
//     const query = { _id: new ObjectId(user_id) };

//     const deleteResult = await ACTIVE_ORDER.deleteOne(query);
//     if (deleteResult.deletedCount === 1) {
//       console.log("Successfully deleted user.");
//     } else {
//       console.log("No user matched this ID. Deleted 0 user.");
//     }

//   }finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }




////////////////////////
//     Endpoints      //
////////////////////////



// Status: TESTED
// GET order data
app.get('/order/:id', function(req, res, next) {
  const order_id = req.params.id
  if (order_id){
    console.log("Order ID: " + order_id)
    var order_data = searchOrder(order_id).catch(console.dir);
    if (order_data){
      res.send(order_data)
    }else{
      res.status(404).send('No such order?')
      res.send(false)
    }
  }else{
    res.send('Invalid Order ID!')
  }
});

// Status: TESTED
// GET order data
app.get('/order/buyer/active/:id', async function(req, res, next) {
  const buyer_id = req.params.id
  if (buyer_id){
    console.log("Buyer ID: " + buyer_id)
    var orders_data = await searchBuyerOrders(buyer_id).catch(console.dir);
    if (orders_data){
      res.status(200).send(orders_data)
    }else{
      res.status(404).send('No such order?')
      res.send(false)
    }
  }else{
    res.send('Invalid Order ID!')
  }
});

// Status: TESTED
// GET order data
app.get('/order/buyer/completed/:id', async function(req, res, next) {
  const buyer_id = req.params.id
  if (buyer_id){
    console.log("Buyer ID: " + buyer_id)
    var orders_data = await searchBuyerCompletedOrders(buyer_id).catch(console.dir);
    if (orders_data){
      res.status(200).send(orders_data)
    }else{
      res.status(404).send('No such order?')
      res.send(false)
    }
  }else{
    res.send('Invalid Order ID!')
  }
});


// Status: TESTED
//  CREATE new order
app.post('/order/new', (req, res) => {

  if (req.body){
    // make sure req.body is a dict
    // return is only the new order ID
    var order_data = createOrder(req.body).catch(console.dir);
    if (order_data){
      res.send(order_data) // order ID
    }else{
      res.send(false)
    }
  }else{
    res.send('Request body missing')
  }
})

// Status: NOT TESTED
// TODO: not tested passing in the req DATA
app.put('/order/updateDeliveryAddress', (req, res) => {
  if (req.body){
    // TODO: req.body need store the order id as 'oid'
    var order_data = editOrderAddress(req.body).catch(console.dir);
    if (order_data){
      res.send(order_data) 
    }else{
      res.send(false)
    }
  }else{
    res.send('edit BODY missing')
  }
})


// Status: NOT TESTED
// TODO: not tested passing in the req DATA
app.put('/order/updateStatus', (req, res) => {
  if (req.body){
    var order_data = updateOrderStatus(req.body).catch(console.dir);
    if (order_data){
      res.send(order_data)
    }else{
      res.send(false)
    }
  }else{
    res.send('edit BODY missing')
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
	console.log("Up and running! -- This is our Order service")
})
