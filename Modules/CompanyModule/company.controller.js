import Application from "../../DataBase/models/application.model.js";
import Company from "../../DataBase/models/company.model.js";
import Joi from "joi";

// Add a company
// AddCompany function steps:
// 1. Validate the request body
// 2. Create a new company
// 3. Send the company data in the response

// @desc    Add a new company
// @route   POST /companies
// @access  Public
export const addCompany = async (req, res, next) => {
  const schema = Joi.object({
    companyName: Joi.string().required(),
    description: Joi.string().required(),
    industry: Joi.string().required(),
    address: Joi.string().required(),
    numberOfEmployees: Joi.object({
      min: Joi.number().required().min(1),
      max: Joi.number().required().max(1000),
    }).required(),
    companyEmail: Joi.string().email().required(),
    companyHR: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const company = await Company.create(req.body);
    res.status(201).json({ message: "Company created successfully", company });
  } catch (err) {
    next(err);
  }
};

// Update company data
// UpdateCompany function steps:
// 1. Validate the request body
// 2. Find the company by id and update it
// 3. Send the updated company data in the response

// @desc    Update a company
// @route   PUT /companies/:companyId
// @access  Private (Company_HR)
export const updateCompany = async (req, res, next) => {
  const schema = Joi.object({
    companyName: Joi.string().required(),
    description: Joi.string().required(),
    industry: Joi.string().required(),
    address: Joi.string().required(),
    numberOfEmployees: Joi.object({
      min: Joi.number().required().min(1),
      max: Joi.number().required().max(1000),
    }).required(),
    companyEmail: Joi.string().email().required(),
    companyHR: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      req.body,
      { new: true }
    );
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company updated successfully", company });
  } catch (err) {
    next(err);
  }
};

// Delete company data
// DeleteCompany function steps:
// 1. Find the company by id and delete it
// 2. Send a success message in the response

// @desc    Delete a company
// @route   DELETE /companies/:companyId
// @access  Private (Company_HR)
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get company data
// GetCompany function steps:
// 1. Find the company by id
// 2. Send the company data in the response

// @desc    Get a company
// @route   GET /companies/:companyId
// @access  Public
export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ company });
  } catch (err) {
    next(err);
  }
};

// Search for a company with a name
// SearchCompanyByName function steps:
// 1. Get the company name from the request query
// 2. Find the company by name
// 3. Send the company data in the response

// @desc    Search for a company by name
// @route   GET /companies/search?companyName=companyName
// @access  Public
export const searchCompanyByName = async (req, res) => {
  const { companyName } = req.query;

  console.log("Searching for company with name:", companyName);

  try {
    const companies = await Company.find({
      companyName: new RegExp(companyName, "i"),
    });

    if (companies.length === 0) {
      return res
        .status(404)
        .json({ message: "No companies found with the specified name" });
    }

    console.log("Companies found:", companies);
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error searching for company:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all applications for a specific job
// GetApplicationsForJob function steps:
// 1. Find all applications for the specified job
// 2. Populate the user data in the applications
// 3. Send the applications data in the response

// @desc    Get all applications for a specific job
// @route   GET /applications/:jobId
// @access  Private (Company_HR)
export const getApplicationsForJob = async (req, res, next) => {
  try {
    const applications = await Application.find({
      jobId: req.params.jobId,
    }).populate("userId");
    res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
};
