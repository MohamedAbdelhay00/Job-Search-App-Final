import { Router } from "express";
import {
  deleteAccount,
  forgetPassword,
  getAccountData,
  getAccountsByRecoveryEmail,
  getProfileData,
  resetPassword,
  signin,
  signup,
  updateAccount,
  updatePassword,
} from "./auth.controller.js";
import {
  forgetPasswordSchema,
  getAccountsByRecoveryEmailSchema,
  resetPasswordSchema,
  signinSchema,
  signupSchema,
  updateAccountSchema,
  updatePasswordSchema,
  validateRequest,
} from "../../Middlewares/validation.js";
import { authenticateToken } from "./auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", validateRequest(signupSchema), signup);
authRouter.post("/signin", validateRequest(signinSchema), signin);
authRouter.put(
  "/update",
  authenticateToken,
  validateRequest(updateAccountSchema),
  updateAccount
);
authRouter.delete("/delete", authenticateToken, deleteAccount);
authRouter.get("/myData", authenticateToken, getAccountData);
authRouter.get("/profile/:userId", authenticateToken, getProfileData);
authRouter.put(
  "/update-password",
  authenticateToken,
  validateRequest(updatePasswordSchema),
  updatePassword
);
authRouter.post(
  "/forget-password",
  validateRequest(forgetPasswordSchema),
  forgetPassword
);
authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword
);
authRouter.get(
  "/accounts-by-recovery-email",
  authenticateToken,
  validateRequest(getAccountsByRecoveryEmailSchema),
  getAccountsByRecoveryEmail
);

export default authRouter;
