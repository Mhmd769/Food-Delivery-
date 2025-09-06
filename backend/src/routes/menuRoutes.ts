import { Router } from "express";
import {
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Get all menu items of a restaurant (public)
router.get("/restaurants/:id/menu", getMenuItems);

// Protected routes for restaurant owners
router.post("/restaurants/:id/menu", protect, authorize("RESTAURANT"), addMenuItem);
router.put("/menu/:id", protect, authorize("RESTAURANT"), updateMenuItem);
router.delete("/menu/:id", protect, authorize("RESTAURANT"), deleteMenuItem);

export default router;
