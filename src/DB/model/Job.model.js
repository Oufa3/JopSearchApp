import mongoose, { Schema, Types, model } from "mongoose";

export const jobLocationTypes = { onsite: "onsite", remotely: "remotely", hybrid: "hybrid" }
export const workingTimeTypes = { partTime: "part-time", fullTime: "full-time" }
export const seniorityLevelTypes = { fresh: "fresh", junior: "Junior", midLevel: "Mid-Level", senior: "Senior", teamLead: "Team-Lead", CTO: "CTO" }


const jobSchema = new Schema({

    jobTitle: {
        type: String,
        required: true
    },
    jobLocation: {
        type: String,
        required: true,
        enum: Object.values(jobLocationTypes),
        default: jobLocationTypes.onsite
    },
    workingTime: {
        type: String,
        required: true,
        enum: Object.values(workingTimeTypes),
        default: workingTimeTypes.partTime
    },
    seniorityLevel: {
        type: String,
        required: true,
        enum: Object.values(seniorityLevelTypes),
        default: seniorityLevelTypes.fresh
    },
    jobDescription: {
        type: String,
        required: true,
    },
    technicalSkills: {
        type: [String],
        required: true,
    },
    softSkills: {
        type: [String],
        required: true,
    },
    addedBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    closed: { type: Boolean, default: false },
    companyId: { type: Types.ObjectId, ref: "Company" },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

jobSchema.virtual("applications", {
    ref: "Application",
    localField: "id",  
    foreignField: "jobId"
});

export const jobModel = mongoose.models.Job || model("Job", jobSchema);
