import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  logoutHandler,
  permissionsHandler,
  permissionListHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", loginHandler);
router.post("/register", registerHandler);
router.post("/logout", requireAuth, logoutHandler);
router.get("/permissions", requireAuth, permissionsHandler);
router.get("/permission-list", requireAuth, permissionListHandler);

export default router;
