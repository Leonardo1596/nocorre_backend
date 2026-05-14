import { Router } from "express";

import {
  startWorkSession,
  pauseWorkSession,
  resumeWorkSession,
  finishWorkSession,
  getWorkSessions
} from "./workSession.controller.js";

import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.post("/start", startWorkSession);

router.patch(
  "/:id/pause",
  pauseWorkSession
);

router.patch(
  "/:id/resume",
  resumeWorkSession
);

router.patch(
  "/:id/finish",
  finishWorkSession
);

router.get("/", getWorkSessions);

export default router;