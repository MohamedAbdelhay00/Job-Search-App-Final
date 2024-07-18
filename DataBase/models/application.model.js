import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Job",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    userTechSkills: {
        type: [String],
        required: true,
    },
    userSoftSkills: {
        type: [String],
        required: true,
    },
    userResume: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

const Application = mongoose.model("Application", applicationSchema);

export default Application;