import { Router } from "express";
import { readJson } from "../utils/fileStore.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { search = "", category, page = "1", limit = "20" } = req.query;
    const products = (await readJson("products.json", [])) || [];
    const q = String(search).toLowerCase();
    const filtered = products.filter((p) => {
      const matchesSearch = q
        ? p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        : true;
      const matchesCategory = category ? p.category === category : true;
      return matchesSearch && matchesCategory;
    });
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const start = (pageNum - 1) * limitNum;
    const items = filtered.slice(start, start + limitNum);
    res.json({ items, total: filtered.length, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const products = (await readJson("products.json", [])) || [];
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

export default router;
