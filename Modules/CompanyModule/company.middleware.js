export const authorizeCompanyHR = (req, res, next) => {
    if (req.user.role !== "Company_HR") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
  