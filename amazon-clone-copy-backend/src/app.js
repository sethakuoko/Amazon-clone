require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("express-async-errors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// serve static frontend assets from the provided frontend copy
const path = require("path");
const fs = require("fs");

// Prefer explicit env override (set this in Docker or your env)
let staticPath = process.env.FRONTEND_PATH
  ? path.resolve(process.env.FRONTEND_PATH)
  : null;

// If not provided, look for a bundled frontend inside the project (used in Docker image)
if (!staticPath) {
  const candidates = [
    path.resolve(__dirname, "..", "frontend"),
    path.resolve(__dirname, "..", "Amazon-clone - Copy"),
    path.resolve(process.cwd(), "Amazon-clone - Copy"),
  ];
  staticPath =
    candidates.find((p) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).isDirectory();
      } catch (e) {
        return false;
      }
    }) || candidates[0];
}

console.log("Serving static frontend from", staticPath);
app.use("/static", express.static(staticPath));

// fallback explicit routes for key assets (style and images)
app.get("/static/style.css", (req, res) => {
  const file = path.join(staticPath, "style.css");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).end();
});

app.get("/static/images/:file", (req, res) => {
  const file = req.params.file;
  const p = path.join(staticPath, "images", file);
  if (fs.existsSync(p)) return res.sendFile(p);
  res.status(404).end();
});

// view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// public JS/CSS served from backend public folder
app.use("/public", express.static(path.join(__dirname, "public")));

// pages
app.get("/product/:id", async (req, res) => {
  const Product = require("./models/Product");
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).send("Not found");
  res.render("product", { product: p });
});

app.get("/cart", async (req, res) => {
  const Cart = require("./models/Cart");
  // try read token for optional user cart
  let cart = { items: [] };
  res.render("cart", { cart });
});

app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/admin/add", (req, res) => res.render("admin_add"));

app.get("/", async (req, res) => {
  const Product = require("./models/Product");
  const q = req.query.q || "";
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const products = await Product.find(filter).limit(20);
  res.render("index", { products });
});

// connect DB
connectDB();

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

// Note: root '/' is handled by the dynamic page route defined earlier

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: { message: err.message || "Server Error" },
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
