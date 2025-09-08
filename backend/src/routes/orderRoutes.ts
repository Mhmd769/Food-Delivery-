import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Customer routes
router.post("/", protect, authorize("CUSTOMER"), createOrder);
router.get("/me", protect, authorize("CUSTOMER"), getMyOrders);
router.get("/:id", protect, authorize("CUSTOMER"), getOrderById);

// Restaurant / Driver / Admin can update status
router.patch(
  "/:id/status",
  protect,
  authorize("RESTAURANT", "DRIVER", "ADMIN"),
  updateOrderStatus
);

export default router;
