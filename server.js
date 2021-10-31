const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
// http://localhost:5000

// https://scary-dracula-51446.herokuapp.com
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is running");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.rexnv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("adven-tour");
    const packages_Collection = database.collection("packages");
    const cart_Collection = database.collection("cart");

    // load packages get api
    app.get("/packages", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = req.query.page;
      const cursor = packages_Collection.find({});
      const count = await cursor.count();
      let packages;

      if (size && page) {
        packages = await cursor
          .skip(size * page)
          .limit(size)
          .toArray();
      } else {
        packages = await cursor.toArray();
      }
      res.json({ count, packages });
    });

    // load single package get api
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await packages_Collection.findOne(query);
      res.json(course);
    });

    // load cart data according to user id get api
    app.get("/cart/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.find(query).toArray();
      res.json(result);
    });

    // add data to cart collection with additional info
    app.post("/package/add", async (req, res) => {
      const package = req.body;
      const result = await cart_Collection.insertOne(package);
      res.json(result);
    });

    // delete data from cart delete api
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cart_Collection.deleteOne(query);
      res.json(result);
    });

    // purchase delete api
    app.delete("/purchase/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.deleteMany(query);
      res.json(result);
    });

    // orders get api
    app.get("/orders", async (req, res) => {
      const result = await cart_Collection.find({}).toArray();
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running on port", port);
});
