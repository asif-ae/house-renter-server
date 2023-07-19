const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.username}:${process.env.password}@cluster0.oxnofiz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const userCollection = await client
      .db("HouseHunterDB")
      .collection("UsersDB");
    const houseCollection = await client
      .db("HouseHunterDB")
      .collection("HouseDB");

    //   user info saved
    app.post("/userinfo", async (req, res) => {
      const newUser = req.body;

      const query = { email: newUser?.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user Laready Exists", save: false });
      }
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // user verify
    app.post("/userpassword", async (req, res) => {
      const { email, password } = req.body;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        if (existingUser.password === password) {
          return res
            .status(200)
            .json({ message: "Login successful.", status: true });
        } else {
          return res
            .status(404)
            .json({ message: "Password not match.", status: false });
        }
      } else {
        return res
          .status(404)
          .json({ message: "User not found.", status: false });
      }
    });

    // new house
    app.post("/house", async (req, res) => {
      const newHouse = req.body;
      const results = await houseCollection.insertOne(newHouse);
      res.status(200).send(results);
    });

    // get individual house
    app.get("/house", async (req, res) => {
      const email = req.query?.email;
      let query = {};
      if (email) {
        query = { email: email };
      }
      const results = await houseCollection.find(query).toArray();
      res.send(results);
    });

    // get all house
    app.get("/allhouse", async (req, res) => {
      const results = await houseCollection.find().toArray();
      res.send(results);
    });

    // find house by id
    app.get("/findhouseby/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const results = await houseCollection.findOne(query);
      res.send(results);
    });

    //find user by email
    app.get("/finduser/:email", async (req, res) => {
      const email = req.params?.email;
      const query = { email: email };
      const results = await userCollection.findOne(query);
      res.send(results);
    });

    // new book house added
    app.post("/bookinghouse", async (req, res) => {
      const newBooking = req.body;
      console.log(newBooking);
      const results = await houseCollection.insertOne(newBooking);
      res.status(200).send(results);
    });

    // load individual owner booked House
    app.get("/findownerbooked", async (req, res) => {
      const email = req.query?.email;
      let query = {};
      if (email) {
        query = { email: email, status: "booked" };
      }
      const results = await houseCollection.find(query).toArray();
      res.send(results);
    });

    // load individual renter booked House
    app.get("/findrenterbooked", async (req, res) => {
      const email = req.query?.email;
      let query = {};
      if (email) {
        query = { customerEmail: email };
      }
      const results = await houseCollection.find(query).toArray();
      res.send(results);
    });

    // delete house
    app.delete("/deletedhouse/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const results = await houseCollection.deleteOne(query);
      res.send(results);
    });

    app.put("/house/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateHouse = req.body;
      console.log(updateHouse);
      const options = { upsert: true };
      const house = {
        $set: {
          houseName: updateHouse.houseName,
          address: updateHouse.address,
          mobileNumber: updateHouse.mobileNumber,
          url: updateHouse.url,
          description: updateHouse.description,
          roomSize: updateHouse.roomSize,
          rentTk: updateHouse.rentTk,
          date: updateHouse.date,
          city: updateHouse.city,
          bedrooms: updateHouse.bedrooms,
          bathrooms: updateHouse.bathrooms,
        },
      };

      const result = await houseCollection.updateOne(query, house, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Welcome to House Hunter Server");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
