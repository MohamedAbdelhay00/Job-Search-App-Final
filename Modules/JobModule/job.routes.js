// job.routes.js
import { Router } from "express";
import {
  addJob,
  updateJob,
  deleteJob,
  getAllJobs,
  getJobsByCompany,
  filterJobs,
  applyToJob,
} from "./job.controller.js";
import { validateRequest, jobSchema } from "../Middlewares/validation.js";
import {
  verifyToken,
  authorizeRole,
} from "../UserModule/auth/auth.middleware.js";

const jobRouter = Router();

jobRouter.post(
  "/",
  verifyToken,
  authorizeRole(["Company_HR"]),
  validateRequest(jobSchema),
  addJob
);
jobRouter.put(
  "/:id",
  verifyToken,
  authorizeRole(["Company_HR"]),
  validateRequest(jobSchema),
  updateJob
);
jobRouter.delete("/:id", verifyToken, authorizeRole(["Company_HR"]), deleteJob);
jobRouter.get(
  "/",
  verifyToken,
  authorizeRole(["User", "Company_HR"]),
  getAllJobs
);
jobRouter.get(
  "/company",
  verifyToken,
  authorizeRole(["Company_HR"]),
  getJobsByCompany
);
jobRouter.get(
  "/filter",
  verifyToken,
  authorizeRole(["User", "Company_HR"]),
  filterJobs
);
jobRouter.post("/apply", verifyToken, authorizeRole(["User"]), applyToJob);

export default jobRouter;
