import mongoose, { Schema, Types, model } from "mongoose";


const companySchema = new Schema({
    companyName: {
        type: String,
        unique: true,
        required: true
    },
    description: String,
    industry: String,
    address: String,
    numberOfEmployees: {
        type: Number,
        min: 11,
        max: 20,
    },
    companyEmail: {
        type: String,
        unique: true,
        required: true
    },
    CreatedBy: { type: Types.ObjectId, ref: "User" },
    Logo: {
        secure_url: String,
        public_id: String
    },
    coverPic: [{
        secure_url: String,
        public_id: String
    }],
    HRs: [{ type: Types.ObjectId, ref: "User" }],
    bannedAt: Date,
    deletedAt: Date,
    isDeleted: Boolean,
    isBanned: Boolean,
    legalAttachment: {
        secure_url: String,
        public_id: String
    },
    approvedByAdmin: Boolean,

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

companySchema.virtual("job", {
    ref: "Job",
    localField: "id",
    foreignField: "companyId"
})

export const companyModel = mongoose.models.Company || model("Company", companySchema);
