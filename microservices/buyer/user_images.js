// To pull the .env file in parent microservices folder
require('dotenv').config({ path: '../env/.env.dev' });
require('dotenv').config({ path: '../env/.env.user' });
const express = require("express");
const app = express();

// If need static files
// app.use(express.static("client")); 

// Connect to mongoDB
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);
const ObjectID = require('mongodb').ObjectId;

const USER_DB = client.db('users')
const USER_IMAGES = USER_DB.collection("images");




////////////////////////
// Database Functions //
////////////////////////


// Status: TESTED
// search user function
async function searchUserDP(user_id) {
  try {
    // Need to keep create 'new ObjectID' to search against mongodb
    // Take note of the '_id'
    const query = { _id: new ObjectID(user_id) };
    const user_profile_data = await USER_IMAGES.findOne(query);
    console.log(user_profile_data);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// Status: TESTED
// TODO add user_data parameter
async function addNewUser() {

  try {
    // create a document to insert
    const doc = {
      first_name: "John",
      last_name: "Doe",
      username: "JonnySins",
      email: "test@test.com",
      password_hash: "test",
      created_at: new Date().getTime(),
      updated_at: new Date().getTime()
    }
    const result = await USER_PROFILE.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  }finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// Status: NOT TESTED
// TODO add the parameter
async function editUser(user_update_data) {

  try {
    const updateDocument = {
      $set: {
        first_name: user_update_data.first_name,
        last_name: user_update_data.last_name,
        email: user_update_data.email,
        updated_at: new Date().getTime()
      },
    }

    const filter = { _id: new ObjectID(user_update_data.id) };

    const result = await USER_PROFILE.updateOne(filter, updateDocument);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  }finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// Status: NOT TESTED
// Delete user
async function deleteUser(user_id) {

  try {
    const query = { _id: new ObjectID(user_id) };

    const deleteResult = await USER_PROFILE.deleteOne(query);
    if (deleteResult.deletedCount === 1) {
      console.log("Successfully deleted user.");
    } else {
      console.log("No user matched this ID. Deleted 0 user.");
    }

  }finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}





////////////////////////
//     Endpoints      //
////////////////////////

// Status: TESTED
// GET user data
app.get('/user/:id', function(req, res, next) {
  const user_id = req.params.id
  if (user_id){
    console.log("User ID: " + user_id)
    searchUser(user_id).catch(console.dir);
  }else{
    res.send('Invalid ID!')
  }
});

// Status: TESTED
//  CREATE new user
app.post('/user/new', (req, res) => {
  if (req.body){
    addNewUser().catch(console.dir);
  }else{
    res.send('BODY missing')
  }
})

// Status: NOT TESTED
// TODO: not tested passing in the req DATA
app.put('/user/:id', (req, res) => {
  if (req.body){
    editUser(req.body).catch(console.dir);
  }else{
    res.send('edit BODY missing')
  }
})

// Status: NOT TESTED
// TODO need to add/set permission for delete feature
app.delete('/user/:id', (req, res) => {
  if (req.params.id){
    deleteUser(req.params.id).catch(console.dir);
  }else{
    res.send('edit BODY missing')
  }
})


app.listen(process.env.PORT, process.env.HOST, () => {
	console.log("Up and running! -- This is our Buyer service")
})
