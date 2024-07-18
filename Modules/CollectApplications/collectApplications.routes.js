import { Router } from 'express';
import { getApplicationsExcel } from './collectApplications.controller.js';
import { verifyToken } from '../UserModule/auth/auth.middleware.js';

const applicationsRouter = Router();

applicationsRouter.get('/excel', verifyToken, getApplicationsExcel);

export default applicationsRouter;
