import { Router } from "express";
import { updateMaintenanceSettings, getMaintenanceSettings } from "./maintenanceSettings.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.put("/update", updateMaintenanceSettings);
router.get("/", getMaintenanceSettings);

export default router;