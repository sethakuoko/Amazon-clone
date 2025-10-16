import { Router } from "express";
import { v4 as uuid } from "uuid";
import { readJson, writeJson } from "../utils/fileStore.js";
import { verifyJwt } from "../utils/jwt.js";

const router = Router();
const ORDERS_FILE = "orders.json";
const TOKEN_COOKIE = "token";

async function getOrders() {
  return (await readJson(ORDERS_FILE, [])) || [];
}

async function saveOrders(orders) {
  await writeJson(ORDERS_FILE, orders);
}

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[TOKEN_COOKIE];
    if (!token) return res.status(401).json({ error: "unauthorized" });
    req.user = verifyJwt(token);
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const orders = await getOrders();
    const mine = orders.filter((o) => o.userId === req.user.sub);
    res.json({ items: mine });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const orders = await getOrders();
    const order = orders.find(
      (o) => o.id === req.params.id && o.userId === req.user.sub
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { items = [], total = 0, shippingAddress = {} } = req.body || {};
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "items required" });
    const orders = await getOrders();
    const order = {
      id: uuid(),
      userId: req.user.sub,
      items,
      total,
      shippingAddress,
      status: "processing",
      paymentStatus: "paid", // mock paid
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    await saveOrders(orders);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
