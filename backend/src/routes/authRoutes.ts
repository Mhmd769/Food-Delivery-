import { Router } from "express";
import { registerUser, loginUser, createUserByAdmin } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/create-user", protect, authorize("ADMIN"), createUserByAdmin);

export default router;
