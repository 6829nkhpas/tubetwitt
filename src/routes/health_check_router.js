import { Router } from "express";
import { health_check } from "../controllers/health_check.js";
const router =Router();

router.route("/").get(health_check);
router.route("/test").get(health_check);
export default router
