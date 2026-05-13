import { Router } from "express";

import {
  createFuelRecord,
  getFuelRecords,
  getLatestFuelRecord
} from "./fuelRecord.controller.js";

import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.post(
  "/",
  createFuelRecord
);

router.get(
  "/",
  getFuelRecords
);

router.get(
  "/latest",
  getLatestFuelRecord
);

export default router;