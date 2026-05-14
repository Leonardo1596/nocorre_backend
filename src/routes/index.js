import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import shiftRoutes from "../modules/shifts/shift.routes.js";
import workSessionRoutes from "../modules/workSessions/workSession.routes.js";
import vehicleSettingsRoutes from "../modules/vehicleSettings/vehicleSettings.routes.js";
import fuelRecordRoutes from "../modules/fuelRecords/fuelRecord.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/shifts", shiftRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/work-sessions", workSessionRoutes);
router.use("/vehicle-settings", vehicleSettingsRoutes);
router.use("/fuel-records", fuelRecordRoutes);


export default router;