import { Router } from "express";
import * as profileService from "./services/profile.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js"
import { authentication } from "../../middleware/auth.middleware.js";
import { fileValidationTypes, uploadDiskFile } from "../../utlis/multer/local.multer.js";
import { uploadCloudFile } from "../../utlis/multer/cloud.multer.js";

const router = Router()

router.patch("/profile",
    validation(validators.updateBasicProfile),
    authentication(),
    profileService.updateBasicProfile)


router.patch("/:userId/ban",
    validation(validators.banUser),
    authentication(),
    profileService.banUser)

router.patch("/profile/Friends/:friendId",
    authentication(),
    validation(validators.addFriend),
    profileService.addFriend)


router.get("/profile",
    authentication(),
    profileService.getProfile)

router.get("/profile/:profileId",
    authentication(),
    validation(validators.shareProfile),
    profileService.shareProfile)

router.patch("/profile/password",
    validation(validators.updatePassword),
    authentication(),
    profileService.updatePassword)

router.patch("/profile/profilePic",
    authentication(),
    uploadCloudFile(fileValidationTypes.image).single("attachment"),
    profileService.uploadProfilePic)

router.delete("/profile/deleteProfilePic",
    authentication(),
    profileService.deleteProfilePic)


router.patch("/profile/coverPic",
    authentication(),
    uploadCloudFile(fileValidationTypes.image).array("attachments", 2),
    profileService.uploadCoverPic)

router.delete("/profile/deleteCoverPic",
    authentication(),
    profileService.deleteCoverPic)



router.patch("/profile/freezeAccount",
    authentication(),
    profileService.freezeAccount)




export default router