import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  numberOfEmployees: {
    min: {
      type: Number,
      required: true,
      min: 11,
    },
    max: {
      type: Number,
      required: true,
      max: 20,
    },
  },
  companyEmail: {
    type: String,
    required: true,
    unique: true,
  },
  companyHR: {
    type: String,
    ref: "User",
    required: true,
  },
});

const Company = mongoose.model("Company", companySchema);

export default Company;
