const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
var cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsljh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("classicWatch");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");

    // Get Products API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const size = parseInt(req.query.size);
      let products;
      if (size) {
        products = await cursor.limit(size).toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send({
        products,
      });
    });

    // Get Single Product API
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productCollection.findOne(query);
      res.json(service);
    });

    // Post user information tp database after register new user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    // Update user information in database if user exists or not in google log in
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // Post order information to database
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await orderCollection.insertOne(orders);
      res.json(result);
    });

    // Get all orders API
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const booking = await cursor.toArray();
      res.send(booking);
    });

    // Get specific user order API
    app.get("/myOrders/:email", async (req, res) => {
      const result = await orderCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Classic Watch Server Connected");
});

app.listen(port, () => {
  console.log(`Classic Watch Server Running On Port`, port);
});
