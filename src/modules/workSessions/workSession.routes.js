import { Router } from "express";

import {
  startWorkSession,
  finishWorkSession,
  getWorkSessions
} from "./workSession.controller.js";

import { auth } from "../../middlewares/auth.js";

const router = Router();

router.use(auth);

router.post("/start", startWorkSession);

router.patch(
  "/:id/finish",
  finishWorkSession
);

router.get("/", getWorkSessions);

export default router;