import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const updateBasicProfile = joi.object().keys({
    firstName: generalFields.firstName,
    lastName: generalFields.lastName,
    DOB: generalFields.DOB,
    mobileNumber: generalFields.mobileNumber,
    gender: generalFields.gender,
}).required()

export const banUser = joi.object().keys({
    userId: generalFields.id.required(),
    action: joi.string().valid("ban", "unban").default("ban"),
}).required()

export const addFriend = joi.object().keys({
    friendId: generalFields.id.required(),
}).required()

export const shareProfile = joi.object().keys({
    profileId: generalFields.id.required(),
}).required()

export const updatePassword = joi.object().keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.confirmPassword.valid(joi.ref("password")).required()
}).required()

