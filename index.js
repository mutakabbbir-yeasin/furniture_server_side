const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middeleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { default: Swal } = require("sweetalert2");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s9op0xi.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const usersCollection = client.db("furnitureDb").collection("users");
    const productCollection = client.db("furnitureDb").collection("product");
    const blogCollection = client.db("furnitureDb").collection("blog");
    const cartCollection = client.db("furnitureDb").collection("cart");

    // user related api
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      console.log("Existing user ===>", existingUser);
      if (existingUser) {
        return res.send({ message: "User already exist" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // product related api
    app.get("/product", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // blog related api
    app.get("/blog", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });

    // CART COLLECTION API
    app.get("/cart", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const userId = req?.body?.email; // Assuming you have the user ID available
      console.log(userId);
      const result = await cartCollection.findOne({
        userId: userId,
        productId: req.body.productId,
      });

      console.log("result", result);

      if (result === null) {
        const product = {
          userId: userId,
          ...req.body,
        };
        // console.log(product);
        const insertResult = await cartCollection.insertOne(product);
        res.send(insertResult);
      } else {
        console.log("already added this product");
        res.send(false);
      }
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Furniture is running");
});

app.listen(port, () => {
  console.log(`Furniture is running on port: ${port}`);
});
