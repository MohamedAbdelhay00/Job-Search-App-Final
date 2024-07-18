import Job from "../../DataBase/models/job.model.js";
import Application from "../../DataBase/models/application.model.js";
import Company from "../../DataBase/models/company.model.js";

//Add Job
// AddJob function steps:
// 1. Get the job data from the request body
// 2. Create a new job
// 3. Send the job data in the response

// @desc    Add a new job
// @route   POST /jobs
// @access  Private (Company_HR)
export const addJob = async (req, res) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy,
  } = req.body;
  try {
    const newJob = await Job.create({
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      addedBy,
    });
    res.status(201).json({ message: "Job added successfully", job: newJob });
  } catch (error) {
    console.error("Error adding job:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Update Job
// UpdateJob function steps:
// 1. Get the job id from the request params
// 2. Get the updated job data from the request body
// 3. Find the job by id and update it
// 4. Send the updated job data in the response

// @desc    Update a job
// @route   PUT /jobs/:id
// @access  Private (Company_HR)
export const updateJob = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res
      .status(200)
      .json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Delete Job
// DeleteJob function steps:
// 1. Get the job id from the request params
// 2. Find the job by id and delete it
// 3. Send a success message in the response

// @desc    Delete a job
// @route   DELETE /jobs/:id
// @access  Private (Company_HR)
export const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get All Jobs with Company Information
// getAllJobs function steps:
// 1. Get all jobs from the database
// 2. Populate the addedBy field with the company data
// 3. Send the jobs data in the response

// @desc    Get all jobs with company information
// @route   GET /jobs
// @access  Private (User, Company_HR)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("addedBy");
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error getting jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get Jobs for Specific Company
// getJobsByCompany function steps:
// 1. Get the company name from the request query
// 2. Find the company by name
// 3. Find all jobs added by the company

// @desc    Get all jobs for a specific company
// @route   GET /jobs/company?companyName=companyName
// @access  Private (Company_HR)
export const getJobsByCompany = async (req, res) => {
  const { companyName } = req.query;

  try {
    console.log("Searching for company with name:", companyName);
    const company = await Company.findOne({
      companyName: new RegExp(companyName, "i"),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    const jobs = await Job.find({ addedBy: company.companyHR }).populate(
      "addedBy"
    );

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs for company:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Filter Jobs
// filterJobs function steps:
// 1. Get the filter data from the request query
// 2. Create a filter object
// 3. Find jobs that match the filter
// 4. Send the jobs data in the response

// @desc    Filter jobs
// @route   GET /jobs/filter?workingTime=full-time&jobLocation=remote&seniorityLevel=entry-level&jobTitle=developer&technicalSkills=javascript,react
// @access  Private (User, Company_HR)
export const filterJobs = async (req, res) => {
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query;
  const filter = {};

  if (workingTime) filter.workingTime = workingTime;
  if (jobLocation) filter.jobLocation = jobLocation;
  if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
  if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");
  if (technicalSkills)
    filter.technicalSkills = { $in: technicalSkills.split(",") };

  try {
    const jobs = await Job.find(filter).populate("addedBy");
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error filtering jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Apply to Job
// Apply to Job function steps:
// 1. Get the application data from the request body
// 2. Create a new application
// 3. Send the application data in the response

// @desc    Apply to a job
// @route   POST /jobs/apply
// @access  Private (User)
export const applyToJob = async (req, res) => {
  const { jobId, userId, userTechSkills, userSoftSkills, userResume } =
    req.body;
  try {
    const application = await Application.create({
      jobId,
      userId,
      userTechSkills,
      userSoftSkills,
      userResume,
    });
    res
      .status(201)
      .json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
