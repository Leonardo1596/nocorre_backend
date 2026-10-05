import { Router } from "express";

import {
  updateVehicleType,
  getVehicleType
} from "./vehicleSettings.controller.js";

import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.put(
  "/",
  updateVehicleType
);

router.get(
  "/",
  getVehicleType
);

export default router;