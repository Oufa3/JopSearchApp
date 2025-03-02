import mongoose, { Schema, Types, model } from "mongoose";

export const statusTypes = { pending: "pending", accepted: "accepted", viewed: "viewed", consideration: "in consideration", rejected: "rejected" }

const ApplicationSchema = new Schema({
    jobId: { type: Types.ObjectId, ref: "Job", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    userCV: {
        secure_url: { type: String,  },
        public_id: { type: String,  }
    },
    status: {
        type: String,
        enum: Object.values(statusTypes),
        default: statusTypes.pending
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export const applicationModel = mongoose.models.Application || model("Application", ApplicationSchema);
