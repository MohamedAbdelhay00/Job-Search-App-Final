import express from 'express'
import authRouter from './Modules/UserModule/auth/auth.routes.js';
import './DataBase/ConnectDB.js';
import errorHandler from './Modules/Middlewares/errorHandler.js';
import companyRouter from './Modules/CompanyModule/company.routes.js';
import jobRouter from './Modules/JobModule/job.routes.js';
import applicationsRouter from './Modules/CollectApplications/collectApplications.routes.js';
const app = express()
const port = 3000

app.use(express.json());

app.use('/auth', authRouter);
app.use("/companies", companyRouter);
app.use('/jobs', jobRouter)
app.use('/applications', applicationsRouter)

app.use(errorHandler)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))