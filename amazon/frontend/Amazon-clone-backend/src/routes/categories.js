import { Router } from "express";
import { readJson } from "../utils/fileStore.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const products = (await readJson("products.json", [])) || [];
    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).map((name) => ({ name, slug: name }));
    res.json({ items: categories });
  } catch (err) {
    next(err);
  }
});

export default router;
