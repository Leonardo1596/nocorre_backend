import { Router } from "express";

import {
  login,
  register
} from "./auth.controller.js";

import {
  loginSchema,
  registerSchema
} from "./auth.validation.js";

import { validate } from "../../middlewares/validate.js";

import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

// valida sessão/token atual
router.get(
  "/me",
  auth,
  async (req, res) => {
    try {
      return res.status(200).json(req.user);
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao validar usuário"
      });
    }
  }
);

export default router;