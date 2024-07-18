import Application from "../../DataBase/models/application.model.js";
import Company from "../../DataBase/models/company.model.js";
import Job from "../../DataBase/models/job.model.js";
import xlsx from "xlsx";
import fs from "fs";

// GetApplicationsExcel function steps:
// 1. Get the company id and date from the request query
// 2. Find the company by id
// 3. Find the jobs added by the company
// 4. Get the job ids
// 5. Find the applications for the jobs on the specified date
// 6. Populate the user data in the applications
// 7. Create an Excel sheet with the applications data
// 8. Send the Excel file in the response

// @desc    Get applications data in Excel format
// @route   GET /applications/excel
// @access  Private (Company_HR)

export const getApplicationsExcel = async (req, res) => {
  const { companyId, date } = req.query;

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setUTCHours(23, 59, 59, 999);
    const jobs = await Job.find({ addedBy: company.companyHR });
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({
      jobId: { $in: jobIds },
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("userId", "firstName lastName email");
    console.log("Applications found:", applications);

    if (applications.length === 0) {
      return res.status(404).json({
        message:
          "No applications found for the specified company on the specified date",
      });
    }

    // Create an Excel sheet
    const wsData = applications.map((app) => ({
      JobId: app.jobId,
      UserId: app.userId._id,
      FirstName: app.userId.firstName,
      LastName: app.userId.lastName,
      Email: app.userId.email,
      TechnicalSkills: app.userTechSkills.join(", "),
      SoftSkills: app.userSoftSkills.join(", "),
    }));

    const ws = xlsx.utils.json_to_sheet(wsData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Applications");

    const filePath = "./applications.xlsx";
    xlsx.writeFile(wb, filePath);

    res.download(filePath, "applications.xlsx", (err) => {
      if (err) {
        console.error("Error sending the Excel file:", err);
        return res.status(500).json({ message: "Error generating Excel file" });
      }

      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting the Excel file:", err);
      });
    });
  } catch (error) {
    console.error("Error generating applications Excel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
