import { Router } from "express";

import {
  startShift,
  finishShift,
  getShifts,
  getShift,
  getShiftMetrics,
  deleteShift,
  deleteByDate
} from "./shift.controller.js";

import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.post("/start", startShift);

router.patch("/:id/finish", finishShift);

router.get("/", getShifts);

router.get(
  "/:id/metrics",
  getShiftMetrics
);

router.delete("/:id", deleteShift);

router.delete("/delete-by-date/:date", deleteByDate);

router.get("/:id", getShift);

export default router;