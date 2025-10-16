const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth");

// create order from cart
router.post("/", auth.required, async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId });
  if (!cart || !cart.items.length)
    return res
      .status(400)
      .json({ success: false, error: { message: "Cart is empty" } });
  const total = cart.items.reduce(
    (s, i) => s + (i.price || 0) * (i.qty || 1),
    0
  );
  const order = await Order.create({
    userId,
    items: cart.items.map((i) => ({
      productId: i.productId,
      title: i.title,
      price: i.price,
      qty: i.qty,
      image: i.image,
    })),
    total,
    shippingAddress: req.body.shippingAddress || {},
  });
  // clear cart
  cart.items = [];
  await cart.save();
  res.json({ success: true, data: order });
});

// get user orders
router.get("/", auth.required, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json({ success: true, data: orders });
});

// get order
router.get("/:id", auth.required, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return res
      .status(404)
      .json({ success: false, error: { message: "Order not found" } });
  if (String(order.userId) !== String(req.user.id) && !req.user.isAdmin)
    return res
      .status(403)
      .json({ success: false, error: { message: "Forbidden" } });
  res.json({ success: true, data: order });
});

module.exports = router;
