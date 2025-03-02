import mongoose, { Schema, Types, model } from "mongoose";
import { generateHash } from "../../utlis/security/hash.security.js";
import { generateEncryptPhone } from "../../utlis/security/encryption.security.js";


export const providerTypes = { google: "google", system: "system" }
export const genderTypes = { male: "male", female: "female" }
export const roleTypes = { user: "user", admin: "admin" }
export const otpTypes = { confirmEmail: 'confirmEmail', forgetPassword: 'forgetPassword' }


const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { type: String },
    forgetPasswordOTP: String,
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.male
    },
    DOB: Date,
    mobileNumber: String,
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean
    },
    isBanned: {
        type: Boolean
    },
    deletedAt: Date,
    bannedAt: Date,
    updatedBy: { type: Types.ObjectId, ref: "User" },
    changeCredentialsTime: Date,
    profilePic: {
        secure_url: String,
        public_id: String,
    },
    coverPic: [{
        secure_url: String,
        public_id: String,
    }],

    OTP: [
        {
            code: { type: String, },
            type: {
                type: String,
                enum: Object.values(otpTypes),
            },
            expiresIn: { type: Date, },
        },
    ],
    friends: [{ type: Types.ObjectId, ref: "User" }],
    forgetpasswordOTP: String,
    attemptCount: Number,
    otpExpiresAt: Date,
    blockUntil: { type: Date, },

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

userSchema.pre("save", function (next) {
    if (this.isModified("password")) {
        const hashPassword = generateHash({ plainText: this.password })
        this.password = hashPassword
    }
    if (this.isModified("mobileNumber") && this.mobileNumber) {
        const encryptPhone = generateEncryptPhone({ phone: this.mobileNumber })
        this.mobileNumber = encryptPhone
    }
    next()
})

userSchema.virtual("username").set(function (value) {
    this.firstName = value.split(" ")[0]
    this.lastName = value.split(" ")[1]
}).get(function () {
    return this.firstName + " " + this.lastName
})


export const userModel = mongoose.models.User || model("User", userSchema);
export const socketConnections = new Map()
