import { Router } from "express";
import * as jobService from "./services/job.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./jobs.validation.js"
import { authentication } from "../../middleware/auth.middleware.js";
import { fileValidationTypes } from "../../utlis/multer/local.multer.js";
import { uploadCloudFile } from "../../utlis/multer/cloud.multer.js";

const router = Router({ mergeParams: true })



router.post("/add",
    authentication(),
    validation(validators.addJob),
    jobService.addJob)


router.patch("/:jobId",
    authentication(),
    validation(validators.updateJob),
    jobService.updateJob)

router.delete("/:jobId",
    authentication(),
    validation(validators.deleteJob),
    jobService.deleteJob)

router.get("/:companyId/jobs/:jobId?",
    authentication(),
    // validation(validators.getJobApp),
    jobService.getJobsForCompany)

router.get("/",
    authentication(),
    jobService.getJobs)

router.get("/:jobId/applications",
    authentication(),
    validation(validators.getJobApp),
    jobService.getJobApplications)

router.post("/:jobId/apply",
    authentication(),
    validation(validators.applyForJob),
    jobService.applyForJob)

router.post("/uploadCV/:applicationId",
    authentication(),
    uploadCloudFile(fileValidationTypes.document).single("document"),
    jobService.uploadUserCV)


router.patch("/:applicationId/status",
    authentication(),
    jobService.updateApplicationStatus);


export default router