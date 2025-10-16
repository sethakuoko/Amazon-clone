import { Router } from "express";
import products from "./products.js";
import categories from "./categories.js";
import cart from "./cart.js";
import auth from "./auth.js";
import orders from "./orders.js";

const router = Router();

router.use("/products", products);
router.use("/categories", categories);
router.use("/cart", cart);
router.use("/auth", auth);
router.use("/orders", orders);

export default router;
