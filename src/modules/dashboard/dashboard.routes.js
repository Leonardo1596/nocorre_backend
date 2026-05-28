import { Router } from "express";

import { getDashboard } from "./dashboard.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.get("/", getDashboard);

export default router;