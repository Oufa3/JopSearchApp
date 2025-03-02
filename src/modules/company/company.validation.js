import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const addCompany = joi.object().keys({
    companyName: generalFields.username.required(),
    companyEmail: generalFields.email.required(),
}).required()
export const banCompany = joi.object().keys({
    companyId: generalFields.id.required(),
}).required()

export const addHR = joi.object({
    companyId: generalFields.id.required(),
    hrId: generalFields.id.required()
}).required();

export const updateCompany = joi.object().keys({
    companyId: generalFields.id.required(),
    companyName: generalFields.username,
    companyEmail: generalFields.email,
}).required()

export const freezeCompany = joi.object().keys({
    companyId: generalFields.id.required(),
}).required()
export const unFreezeCompany = joi.object().keys({
    companyId: generalFields.id.required(),
}).required()

export const specificCompany = joi.object().keys({
    companyId: generalFields.id.required(),
}).required()

export const logoPic = joi.object().keys({
    logoPicId: generalFields.id.required(),
}).required()
export const delPic = joi.object().keys({
    logoPicId: generalFields.id.required(),
}).required()
export const coverPic = joi.object().keys({
    coverPicId: generalFields.id.required(),
}).required()
export const delCoverPic = joi.object().keys({
    coverPicId: generalFields.id.required(),
}).required()

export const searchCompanyName = joi.object().keys({
    companyName: generalFields.username.required(),
}).required()


