import { Router } from "express";
import * as companyService from "./services/company.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./company.validation.js"
import { authentication } from "../../middleware/auth.middleware.js";
import { uploadCloudFile } from "../../utlis/multer/cloud.multer.js";
import { fileValidationTypes } from "../../utlis/multer/local.multer.js";

const router = Router()



router.post("/",
    authentication(),
    validation(validators.addCompany),
    companyService.addCompany)

router.patch("/:companyId/ban",
    validation(validators.banCompany),
    authentication(),
    companyService.banCompany)

router.post("/addHR",
    authentication(),
    validation(validators.addHR),
    companyService.addHRToCompany);

router.post("/:companyId",
    authentication(),
    validation(validators.updateCompany),
    companyService.updateCompany)

router.delete("/freeze/:companyId/",
    authentication(),
    validation(validators.freezeCompany),
    companyService.freezeCompany)

router.patch("/unfreeze/:companyId/",
    authentication(),
    validation(validators.unFreezeCompany),
    companyService.unFreezeCompany)

router.get("/specific/:companyId",
    authentication(),
    validation(validators.specificCompany),
    companyService.specificCompany)

router.get("/search",
    authentication(),
    validation(validators.searchCompanyName),
    companyService.searchCompanyName)

router.patch("/logo/:logoPicId",
    authentication(),
    validation(validators.logoPic),
    uploadCloudFile(fileValidationTypes.image).single("attachment"),
    companyService.uploadLogo)

router.delete("/logo/:logoPicId",
    authentication(),
    validation(validators.delPic),
    companyService.deleteLogo)

router.patch("/cover/:coverPicId",
    authentication(),
    validation(validators.coverPic),
    uploadCloudFile(fileValidationTypes.image).array("attachments", 2),
    companyService.uploadCoverPic)

router.delete("/cover/:coverPicId",
    authentication(),
    validation(validators.delCoverPic),
    companyService.deleteCoverPic)


export default router