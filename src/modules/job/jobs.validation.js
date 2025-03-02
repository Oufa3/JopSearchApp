import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const addJob = joi.object().keys({
    companyId: generalFields.id.required(),
    jobTitle: generalFields.jobTitle.required(),
    jobLocation: generalFields.jobLocation.required(),
    workingTime: generalFields.workingTime.required(),
    seniorityLevel: generalFields.seniorityLevel,
    jobDescription: generalFields.jobDescription,
    technicalSkills: generalFields.technicalSkills,
    softSkills: generalFields.softSkills,
}).required()

export const updateJob = joi.object().keys({
    jobId: generalFields.id.required(),
    jobTitle: generalFields.jobTitle,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    jobDescription: generalFields.jobDescription,
    technicalSkills: generalFields.technicalSkills,
    softSkills: generalFields.softSkills,
}).required()
export const deleteJob = joi.object().keys({
    jobId: generalFields.id.required(),
}).required()
export const getJobApp = joi.object().keys({
    jobId: generalFields.id,
}).required()
export const applyForJob = joi.object().keys({
    jobId: generalFields.id.required(),
}).required()

export const getJobs = joi.object().keys({
    companyId: generalFields.id.required(),
    jobId: generalFields.id,
    workingTime: generalFields.workingTime,
    jobLocation: generalFields.jobLocation,
    seniorityLevel: generalFields.seniorityLevel,
    jobTitle: generalFields.jobTitle,
    technicalSkills: generalFields.technicalSkills,
}).required()
