import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  addToHistory,
  getCurrentUser,
  getUserHistory,
  login,
  register,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Credential endpoints were previously unthrottled. Beyond brute force, each
 * attempt costs a bcrypt hash at cost 10, so unlimited requests are also a cheap
 * CPU-exhaustion vector.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

router.get("/me", requireAuth, getCurrentUser);
router.get("/get_all_activity", requireAuth, getUserHistory);
router.post("/add_to_activity", requireAuth, addToHistory);

export default router;
