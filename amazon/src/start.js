require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const { spawn } = require("child_process");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongo:27017/amazon_clone_copy";

const products = [
  {
    title: "Stylish Shirt",
    description: "A fashionable shirt",
    price: 1999,
    image: "/static/images/box1_image.jpg",
    category: "Cloths",
    inventory: 50,
  },
  {
    title: "Health Kit",
    description: "Personal care essentials",
    price: 2999,
    image: "/static/images/box2_image.jpg",
    category: "Health and Personal care",
    inventory: 100,
  },
  {
    title: "Comfort Chair",
    description: "Ergonomic furniture",
    price: 15999,
    image: "/static/images/box3_image.jpg",
    category: "Furniture",
    inventory: 20,
  },
  {
    title: "Wireless Headphones",
    description: "Noise cancelling headphones",
    price: 4999,
    image: "/static/images/box4_image.jpg",
    category: "Electronics",
    inventory: 40,
  },
  {
    title: "Skin Care Set",
    description: "Premium skin care products",
    price: 2599,
    image: "/static/images/box5_image.jpg",
    category: "Skin Care",
    inventory: 60,
  },
  {
    title: "Pet Essentials",
    description: "Everything for your pet",
    price: 3499,
    image: "/static/images/box6_image.jpg",
    category: "Pets care",
    inventory: 80,
  },
  {
    title: "Toys & New Arrivals",
    description: "Latest toys and arrivals",
    price: 1299,
    image: "/static/images/box7_image.jpg",
    category: "New Arrival and toys",
    inventory: 120,
  },
  {
    title: "Fashion Style",
    description: "Trendy fashion items",
    price: 1999,
    image: "/static/images/box8_image.jpg",
    category: "New Fashion style",
    inventory: 70,
  },
];

async function waitForMongo(uri, retries = 20, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      console.log("Waiting for MongoDB... attempt", i + 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unable to connect to MongoDB");
}

(async function main() {
  try {
    await waitForMongo(MONGO_URI);
    const Product = require("./models/Product");
    const count = await Product.countDocuments();
    if (!count) {
      console.log("Seeding products...");
      await Product.insertMany(products);
      console.log("Seeded products");
    } else {
      console.log("Products already present:", count);
    }

    // spawn the actual app
    const child = spawn("node", ["src/app.js"], { stdio: "inherit" });
    child.on("exit", (code) => process.exit(code));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
