import { Router } from "express";
import { addToCart, removeFromCart, getCart ,updateCartItem ,deleteCart } from "../controllers/cartController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/cart/add", protect, authorize("CUSTOMER"), addToCart);
router.post("/cart/remove", protect, authorize("CUSTOMER"), removeFromCart);
router.get("/cart", protect, authorize("CUSTOMER"), getCart);
router.put("/cart/update/:id", protect, authorize("CUSTOMER"), updateCartItem);



router.delete("/cart/item", protect, authorize("CUSTOMER"), removeFromCart); // remove single item
router.delete("/cart", protect, authorize("CUSTOMER"), deleteCart);          // delete entire cart


export default router;
