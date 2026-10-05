import { Router } from "express";
import { updateMaintenanceSettings, getMaintenanceSettings, addMaintenanceItem, deleteMaintenanceItem } from "./maintenanceSettings.controller.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.put("/update", updateMaintenanceSettings);
router.get("/", getMaintenanceSettings);
router.post("/items", addMaintenanceItem);
router.delete("/items/:id", deleteMaintenanceItem);
export default router;