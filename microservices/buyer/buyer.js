// To pull the .env file in parent microservices folder
require('dotenv').config({ path: '../env/.env.dev' });
require('dotenv').config({ path: '../env/.env.buyer' });
const express = require("express");
var bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
app.use(cors())


// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// If need static files
// app.use(express.static("client")); 

// Connect to mongoDB
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);
const { ObjectId } = require('mongodb');
const { type } = require('os');

const USER_DB = client.db('buyer')
const USER_PROFILE = USER_DB.collection("profile");




////////////////////////
// Database Functions //
////////////////////////


// Status: TESTED
// search user function
async function searchUser(user_id) {
  try {
    // Need to keep create 'new ObjectId' to search against mongodb
    // Take note of the '_id'
    console.log(typeof user_id)
    const query = { _id: new ObjectId(user_id) };
    const user_profile_data = await USER_PROFILE.findOne(query);
    console.log(user_profile_data);
    return user_profile_data
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

// Status: TESTED
// TODO add user_data parameter
async function addNewUser() {

  try {
    // create a document to insert
    const doc = {
      first_name: "test",
      last_name: "hehe",
      username: "hhh",
      email: "haha@haha.com",
      password_hash: "123",
      mobile: 88888888,
      images: {
        dp: {
          src: "https://picsum.photos/200",
          created_at: new Date().getTime(),
          updated_at: new Date().getTime()
        }
      },
      address: {
        primary: {
          country: "Singapore",
          created_at: new Date().getTime(),
          updated_at: new Date().getTime()
        }
      },
      created_at: new Date().getTime(),
      updated_at: new Date().getTime()
    }
    const result = await USER_PROFILE.insertOne(doc);
    if(result){
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      return result
    }else{
      return false
    }
    
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

    const filter = { _id: new ObjectId(user_update_data.id) };

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
    const query = { _id: new ObjectId(user_id) };

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


// Status: NOT TESTED
// login user
async function loginUser(user_email,user_password) {

  try {
    const query = { email: user_email };

    const searchResult = await USER_PROFILE.findOne(query);
    if (searchResult && searchResult.password_hash === user_password) {
      console.log("Correct User! Loggin in!!!");
      
      var user_data = {
        uid: searchResult._id.toString(),
        username: searchResult.username,
        email: searchResult.email
      }

      
      return (user_data)
    } else {
      console.log("No user matched this ID. 0 user.");
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
// GET user data
app.post('/login', jsonParser, async function(req, res, next) {
  // console.log(req.body)
  const user_email = req.body.email
  const user_password = req.body.password
  if (user_email && user_password){
    await loginUser(user_email,user_password).catch(console.dir)
    .then(function (login_user) {
      if (login_user){

        console.log(typeof (login_user),login_user)
        res.send(token)
      }else{
        res.send(null)
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }else{
    res.send('Invalid ID!')
  }
});


// Status: TESTED
// GET user data
app.get('/buyer/:id', async function(req, res, next) {
  const user_id = req.params.id
  if (user_id){
    console.log("User ID: " + user_id)
    var buyer_data = await searchUser(user_id).catch(console.dir);
    if(buyer_data){
      console.log("hereee-----")
      console.log(buyer_data)
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(buyer_data))
    }else{
      res.status(404).send({data: "No such buyer found!"})
    }
  }else{
    res.send('Invalid ID!')
  }
});

// Status: TESTED
//  CREATE new user
app.get('/user/new', (req, res) => {

  // user dp image 

  // check static data
  // TODO able to store the image in the POST request
  // ^ may need change the if condition
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
