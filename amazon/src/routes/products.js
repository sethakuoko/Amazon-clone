const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// list products
router.get("/", async (req, res) => {
  const q = req.query.q || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const total = await Product.countDocuments(filter);
  const items = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);
  res.json({
    success: true,
    data: { items, total, page, pages: Math.ceil(total / limit) },
  });
});

// get product
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res
      .status(404)
      .json({ success: false, error: { message: "Not found" } });
  res.json({ success: true, data: product });
});

// admin create product
router.post("/", auth.required, async (req, res) => {
  if (!req.user.isAdmin)
    return res
      .status(403)
      .json({ success: false, error: { message: "Forbidden" } });
  const { title, description, price, image, category, inventory } = req.body;
  const p = await Product.create({
    title,
    description,
    price,
    image,
    category,
    inventory,
  });
  res.json({ success: true, data: p });
});

module.exports = router;
