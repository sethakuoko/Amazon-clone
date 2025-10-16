require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const path = require("path");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/amazon_clone_copy";

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

(async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to", MONGO_URI);
  await Product.deleteMany({});
  // create admin user
  const User = require("../models/User");
  const bcrypt = require("bcryptjs");
  await User.deleteMany({});
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash("adminpass", salt);
  await User.create({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: adminHash,
    isAdmin: true,
  });
  console.log("Created admin user: admin@example.com / adminpass");
  await Product.insertMany(products);
  console.log("Seeded products");
  process.exit(0);
})();
