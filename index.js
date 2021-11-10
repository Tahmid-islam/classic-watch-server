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

    //GET Products API
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

    //GET Single Product API
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productCollection.findOne(query);
      res.json(service);
    });

    console.log("Database Connected Successfully");
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
