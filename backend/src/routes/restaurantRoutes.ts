import { Router } from "express";
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

router.post("/", protect, authorize("RESTAURANT"), createRestaurant);
router.put("/:id", protect, authorize("RESTAURANT"), updateRestaurant);
router.delete("/:id", protect, authorize("RESTAURANT"), deleteRestaurant);

export default router;
