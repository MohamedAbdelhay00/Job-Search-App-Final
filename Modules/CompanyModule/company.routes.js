import {
  addCompany,
  updateCompany,
  deleteCompany,
  getCompany,
  searchCompanyByName,
  getApplicationsForJob,
} from "./company.controller.js";
import { authorizeCompanyHR } from "./company.middleware.js";
import {
  authenticateToken,
  authorizeRole,
  verifyToken,
} from "../UserModule/auth/auth.middleware.js";
import { Router } from "express";

const companyRouter = Router();

companyRouter.post("/", authenticateToken, authorizeCompanyHR, addCompany);
companyRouter.put(
  "/:companyId",
  authenticateToken,
  authorizeCompanyHR,
  updateCompany
);
companyRouter.delete(
  "/:companyId",
  authenticateToken,
  authorizeCompanyHR,
  deleteCompany
);
companyRouter.get("/:companyId", authenticateToken, getCompany);
companyRouter.get(
  "/search",
  verifyToken,
  authorizeRole(["User", "Company_HR"]),
  searchCompanyByName
);
companyRouter.get(
  "/:jobId/applications",
  authenticateToken,
  authorizeCompanyHR,
  getApplicationsForJob
);

export default companyRouter;
