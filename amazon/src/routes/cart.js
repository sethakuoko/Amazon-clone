const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// get cart for user
router.get("/", auth.optional, async (req, res) => {
  const userId = req.user ? req.user.id : null;
  let cart = null;
  if (userId) cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart) cart = { items: [] };
  res.json({ success: true, data: cart });
});

// add item
router.post("/items", auth.optional, async (req, res) => {
  const { productId, qty } = req.body;
  if (!productId)
    return res
      .status(400)
      .json({ success: false, error: { message: "Missing productId" } });
  const product = await Product.findById(productId);
  if (!product)
    return res
      .status(404)
      .json({ success: false, error: { message: "Product not found" } });
  const userId = req.user ? req.user.id : null;
  let cart = null;
  if (userId) cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  const existing = cart.items.find(
    (i) => String(i.productId) === String(productId)
  );
  if (existing) existing.qty = (existing.qty || 1) + (qty || 1);
  else
    cart.items.push({
      productId,
      title: product.title,
      price: product.price,
      qty: qty || 1,
      image: product.image,
    });
  await cart.save();
  res.json({ success: true, data: cart });
});

// update item qty
router.put("/items/:itemId", auth.optional, async (req, res) => {
  const { qty } = req.body;
  const userId = req.user ? req.user.id : null;
  if (!userId)
    return res
      .status(401)
      .json({ success: false, error: { message: "Auth required" } });
  const cart = await Cart.findOne({ userId });
  if (!cart)
    return res
      .status(404)
      .json({ success: false, error: { message: "Cart not found" } });
  const item = cart.items.id(req.params.itemId);
  if (!item)
    return res
      .status(404)
      .json({ success: false, error: { message: "Item not found" } });
  item.qty = qty;
  await cart.save();
  res.json({ success: true, data: cart });
});

// remove item
router.delete("/items/:itemId", auth.optional, async (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId)
    return res
      .status(401)
      .json({ success: false, error: { message: "Auth required" } });
  const cart = await Cart.findOne({ userId });
  if (!cart)
    return res
      .status(404)
      .json({ success: false, error: { message: "Cart not found" } });
  cart.items.id(req.params.itemId).remove();
  await cart.save();
  res.json({ success: true, data: cart });
});

module.exports = router;
