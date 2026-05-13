import { Router } from "express";

import {
  createOrUpdateVehicleSettings,
  getVehicleSettings
} from "./vehicleSettings.controller.js";

import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.put(
  "/",
  createOrUpdateVehicleSettings
);

router.get(
  "/",
  getVehicleSettings
);

export default router;