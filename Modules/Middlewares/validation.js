import Joi from "joi";

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  recoveryEmail: Joi.string().email().optional(),
  DOB: Joi.date().iso().required(),
  mobileNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),
  role: Joi.string().valid("User", "Company_HR").required(),
});

const signinSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const updateAccountSchema = Joi.object({
  email: Joi.string().email().optional(),
  mobileNumber: Joi.string()
    .pattern(/^[0-9]+$/)
    .optional(),
  recoveryEmail: Joi.string().email().optional(),
  DOB: Joi.date().iso().optional(),
  lastName: Joi.string().optional(),
  firstName: Joi.string().optional(),
});

const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const getAccountsByRecoveryEmailSchema = Joi.object({
  recoveryEmail: Joi.string().email().required(),
});

const jobSchema = Joi.object({
  jobTitle: Joi.string().required(),
  jobLocation: Joi.string().valid("Onsite", "Remotely", "Hybrid").required(),
  workingTime: Joi.string().valid("Part-Time", "Full-Time").required(),
  seniorityLevel: Joi.string()
    .valid("Junior", "Mid-Level", "Senior", "Team-Lead", "CTO")
    .required(),
  jobDescription: Joi.string().required(),
  technicalSkills: Joi.array().items(Joi.string()).required(),
  softSkills: Joi.array().items(Joi.string()).required(),
  addedBy: Joi.string().required(),
});

export {
  validateRequest,
  signupSchema,
  signinSchema,
  updateAccountSchema,
  updatePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  getAccountsByRecoveryEmailSchema,
  jobSchema,
};
