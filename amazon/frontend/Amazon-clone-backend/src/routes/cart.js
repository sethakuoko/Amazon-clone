import { Router } from "express";
import { readJson, writeJson } from "../utils/fileStore.js";

const router = Router();

function cartFile(sessionId) {
  return `cart_${sessionId}.json`;
}

async function getCart(sessionId) {
  return (await readJson(cartFile(sessionId), { items: [] })) || { items: [] };
}

async function saveCart(sessionId, cart) {
  await writeJson(cartFile(sessionId), cart);
}

router.get("/", async (req, res, next) => {
  try {
    const cart = await getCart(req.sessionId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const { productId, qty = 1, price = 0, title, image } = req.body || {};
    if (!productId)
      return res.status(400).json({ error: "productId required" });
    const cart = await getCart(req.sessionId);
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.qty += Number(qty) || 1;
    } else {
      cart.items.push({
        productId,
        qty: Number(qty) || 1,
        price,
        title,
        image,
      });
    }
    await saveCart(req.sessionId, cart);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

router.patch("/items/:productId", async (req, res, next) => {
  try {
    const qty = Number(req.body?.qty);
    if (!Number.isFinite(qty) || qty < 0)
      return res.status(400).json({ error: "qty must be >= 0" });
    const cart = await getCart(req.sessionId);
    const item = cart.items.find((i) => i.productId === req.params.productId);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (qty === 0) {
      cart.items = cart.items.filter(
        (i) => i.productId !== req.params.productId
      );
    } else {
      item.qty = qty;
    }
    await saveCart(req.sessionId, cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.delete("/items/:productId", async (req, res, next) => {
  try {
    const cart = await getCart(req.sessionId);
    const before = cart.items.length;
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
    if (cart.items.length === before)
      return res.status(404).json({ error: "Item not found" });
    await saveCart(req.sessionId, cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const empty = { items: [] };
    await saveCart(req.sessionId, empty);
    res.json(empty);
  } catch (err) {
    next(err);
  }
});

export default router;
