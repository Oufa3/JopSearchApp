import joi from "joi"
import { genderTypes } from "../DB/model/user.model.js"
import { jobLocationTypes, seniorityLevelTypes, workingTimeTypes } from "../DB/model/Job.model.js"

export const generalFields = {
    id: joi.string().pattern(new RegExp('^[0-9a-fA-F]{24}$')),
    firstName: joi.string().min(2).max(12).trim(),
    lastName: joi.string().min(2).max(12).trim(),
    username: joi.string().min(2).max(25).trim(),
    email: joi.string().email({ tlds: { allow: ["com", "net"] }, minDomainSegments: 2, maxDomainSegments: 3 }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)),
    confirmPassword: joi.string(),
    mobileNumber: joi.string().pattern(RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    code: joi.string().pattern(new RegExp(/^\d{4}$/)),
    DOB: joi.date().less("now"),
    gender: joi.string().valid(...Object.values(genderTypes)),

    //////Job
    jobTitle: joi.string().min(2).max(50).trim(),
    jobLocation: joi.string().valid(...Object.values(jobLocationTypes)),
    workingTime: joi.string().valid(...Object.values(workingTimeTypes)),
    seniorityLevel: joi.string().valid(...Object.values(seniorityLevelTypes)),
    jobDescription: joi.string().min(10).max(1000).trim(),
    technicalSkills: joi.array().items(joi.string().min(2).max(100).trim()),
    softSkills: joi.array().items(joi.string().min(2).max(50).trim()),
}

export const validation = (schema) => {
    return (req, res, next) => {
        const inputData = { ...req.body, ...req.params, ...req.query }
        const validationResult = schema.validate(inputData, { abortEarly: false })
        if (validationResult.error) {
            return res.status(400).json({ message: "Validation Error", details: validationResult.error.details })
        }
        return next()
    }

}