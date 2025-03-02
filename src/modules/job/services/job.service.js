import { asyncHandler } from "../../../utlis/response/error.response.js"
import { successResponse } from "../../../utlis/response/success.response.js"
import * as dbService from "../../../DB/db.Service.js"
import { companyModel } from "../../../DB/model/Company.model.js"
import { jobModel } from "../../../DB/model/Job.model.js"
import { roleTypes } from "../../../DB/model/user.model.js"
import { applicationModel } from "../../../DB/model/Application.model.js"
import cloud from "../../../utlis/multer/cloudinary.js";
import { emailEvent } from "../../../utlis/events/email.events.js"



export const addJob = asyncHandler(
    async (req, res, next) => {
        const { companyId, jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body
        const userId = req.user._id
        const company = await dbService.findOne({
            model: companyModel,
            filter: { _id: companyId }
        })
        if (!company) {
            return next(new Error("In-Valid id Or Not Found."))
        }
        const isOwner = company.CreatedBy.toString() === userId.toString()
        const isHR = company.HRs.some(hrId => hrId.toString() === userId.toString())
        if (!isOwner && !isHR) {
            return next(new Error("You do not have permission to add  job for this company."));
        }
        const job = await dbService.create({
            model: jobModel,
            data: {
                companyId, jobTitle, jobLocation, workingTime, seniorityLevel,
                jobDescription, technicalSkills, softSkills, addedBy: userId
            }
        })
        return successResponse({ res, data: { job } })
    }
)
export const updateJob = asyncHandler(
    async (req, res, next) => {
        const { jobId } = req.params
        const userId = req.user._id
        const job = await dbService.findOne({
            model: jobModel,
            filter: { _id: jobId }
        })
        if (!job) {
            return next(new Error("Job not found"));
        }
        if (job.addedBy.toString() !== userId.toString()) {
            return next(new Error("You do not have permission to update this job"));
        }
        const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body
        const updatedJob = await dbService.findByIdAndUpdate({
            model: jobModel,
            id: jobId,
            data: {
                jobTitle, jobLocation, workingTime,
                seniorityLevel, jobDescription, technicalSkills, softSkills
            }, options: { new: true }
        })

        return successResponse({ res, data: { updatedJob } })
    }
)

export const deleteJob = asyncHandler(
    async (req, res, next) => {
        const { jobId } = req.params
        const userId = req.user._id
        const job = await dbService.findOne({
            model: jobModel,
            filter: { _id: jobId }
        })
        if (!job) {
            return next(new Error("Job not found."));
        }
        const company = await dbService.findOne({
            model: companyModel,
            filter: { _id: job.companyId }
        })
        if (!company) {
            return next(new Error("company not found."));
        }
        const companyHR = company.HRs.some(hr => hr.toString() === userId.toString())
        if (!companyHR) {
            return next(new Error("You do not have permission to delete this job."));
        }
        await dbService.findByIdAndUpdate({
            model: jobModel,
            id: jobId,
            data: {
                closed: true,
                deletedAt: new Date()
            }, options: { new: true }
        })
        return successResponse({ res, message: "Job Deleted Successfully:" })
    }

)
export const getJobsForCompany = asyncHandler(
    async (req, res, next) => {
        const { companyId, jobId } = req.params
        const { companyName, page = 1, limit = 5, sort = "-createdAt" } = req.query;
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1
        const pageSize = parseInt(limit) > 0 ? parseInt(limit) : 5;
        const skip = (pageNumber - 1) * pageSize;
        let filter = {}
        if (companyName) {
            const company = await dbService.findOne({
                model: companyModel,
                filter: { companyName: { $regex: companyName, $options: "i" } }
            });
            if (!company) {
                return res.status(404).json({ message: "Company not found" });
            }
            filter.companyId = company._id
        }
        if (companyId) {
            filter.companyId = companyId
        }
        if (jobId) {
            filter._id = jobId
        }

        const totalCount = await jobModel.countDocuments(filter);

        const jobs = jobId ? await dbService.findOne({ model: jobModel, filter }) :
            await dbService.findAll({
                model: jobModel,
                filter, skip, limit: pageSize, sort, populate: ["companyId"]
            })

        if (jobId && !jobs) {
            return res.status(404).json({ message: "Job not found" });
        }
        return successResponse({ res, data: { totalCount, jobs } })
    }

)


export const getJobs = asyncHandler(async (req, res, next) => {
    const {
        workingTime,
        jobLocation,
        seniorityLevel,
        jobTitle,
        technicalSkills,
        page = 1,
        limit = 5,
        sort = "-createdAt"
    } = req.body;

    const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
    const pageSize = parseInt(limit) > 0 ? parseInt(limit) : 5;
    const skip = (pageNumber - 1) * pageSize;

    let filter = {};

    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: "i" };

    if (technicalSkills) {
        if (typeof technicalSkills === "string") {
            filter.technicalSkills = { $in: technicalSkills.split(",") };
        } else if (Array.isArray(technicalSkills)) {
            filter.technicalSkills = { $in: technicalSkills };
        }
    }
    const totalCount = await jobModel.countDocuments(filter);


    const jobs = await dbService.findAll({
        model: jobModel,
        filter,
        skip,
        limit: pageSize,
        populate: ["companyId"],
        sort
    });

    return successResponse({
        res, data: {
            totalCount,
            page: pageNumber,
            pageSize,
            jobs
        }
    });
});

export const getJobApplications = asyncHandler(async (req, res, next) => {

    const { jobId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const userId = req.user._id;

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    const job = await dbService.findOne({
        model: jobModel,
        filter: { _id: jobId },
        populate: [
            {
                path: "companyId",
                select: "CreatedBy HRs"
            },
            {
                path: "applications",
                options: { sort, skip, limit: pageSize },
                populate: { path: "userId", select: "username email phone" }
            }
        ]
    });
    if (!job) {
        return next(new Error("Job not found", { statusCode: 404 }));
    }
    const applications = await applicationModel.find({ jobId })
        .populate("userId", "firstName lastName email gender mobileNumber role")
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort)

    const totalApplications = await applicationModel.countDocuments({ jobId });

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: job.companyId }
    });
    const owner = company.CreatedBy.toString() === userId.toString()
    const HR = company.HRs.some(hrId => hrId.toString() === userId.toString())
    if (!owner && !HR) {
        return next(new Error("You do not have permission to view applications for this job."));
    }

    return successResponse({
        res, data: {
            totalApplications,
            applications
        }
    });
});



export const applyForJob = asyncHandler(async (req, res, next) => {

    const userId = req.user._id;
    const { jobId } = req.params;
    if (!jobId) {
        return next(new Error("jobId is required!", { cause: 400 }));
    }
    const application = await dbService.findOne({
        model: applicationModel,
        filter: { userId, jobId }
    })
    if (application) {
        return next(new Error("You have already applied for this job!", { cause: 400 }));
    }
    const newApplication = await dbService.create({
        model: applicationModel,
        data: { userId, jobId }
    });
    return successResponse({
        res, message: "Job application submitted!", status: 201, data: {
            applicationId: newApplication._id
        }
    });
});



export const uploadUserCV = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { applicationId } = req.params;
    if (!req.file) {
        return next(new Error("CV file is required!", { cause: 400 }));
    }
    const application = await dbService.findOne({
        model: applicationModel,
        filter: { _id: applicationId, userId }
    });
    if (!application) {
        return next(new Error("Application not found!", { cause: 404 }));
    }
    if (application.userCV?.public_id) {
        await cloud.uploader.destroy(application.userCV.public_id);
    }
    const uploadResult = await cloud.uploader.upload(req.file.path, {
        folder: "user_CVs",
        resource_type: "auto",
    });
    application.userCV = {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
    };

    await application.save();

    return successResponse({ res, message: "CV uploaded successfully.", status: 201, data: { application } });
});

export const updateApplicationStatus = asyncHandler(async (req, res, next) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!["accepted", "rejected"].includes(status)) {
        return next(new Error("Invalid status. Use 'accepted' or 'rejected'.", { cause: 400 }));
    }
    const application = await applicationModel.findById(applicationId)
        .populate({
            path: "jobId",
            populate: { path: "companyId", select: "CreatedBy HRs" }
        })
        .populate({ path: "userId", select: "email firstName lastName" });
    if (!application) {
        return next(new Error("Application not found!", { cause: 404 }));
    }
    const job = application.jobId;
    if (!job) {
        return next(new Error("Job not found!", { cause: 404 }));
    }
    const company = job.companyId;
    if (!company) {
        return next(new Error("Company not found!", { cause: 404 }));
    }
    const isOwner = company.CreatedBy?.toString() === userId.toString();
    const isHR = company.HRs?.some(hrId => hrId.toString() === userId.toString());
    if (!isOwner && !isHR) {
        return next(new Error("You do not have permission to update this application!", { cause: 403 }));
    }
    application.status = status;
    await application.save();
    const emailData = {
        email: application.userId.email,
        name: `${application.userId.firstName} ${application.userId.lastName}`,
        jobTitle: job.jobTitle
    };
    if (status === "accepted") {
        emailEvent.emit("jobAccepted", emailData);
    } else {
        emailEvent.emit("jobRejected", emailData);
    }
    return successResponse({ res, message: `Application has been ${status} successfully.` });
});
