import { asyncHandler } from "../../../utlis/response/error.response.js"
import { successResponse } from "../../../utlis/response/success.response.js"
import * as dbService from "../../../DB/db.Service.js"
import { companyModel } from "../../../DB/model/Company.model.js"
import { roleTypes, userModel } from "../../../DB/model/user.model.js"
import cloud from "../../../utlis/multer/cloudinary.js";


export const addCompany = asyncHandler(
    async (req, res, next) => {
        const { companyName, companyEmail } = req.body
        const existingCompany = await dbService.findOneAndUpdate({
            model: companyModel,
            filter: { $or: [{ companyName }, { companyEmail }] }
        })
        if (existingCompany) {
            return next(new Error("Company Email Or Company Name already exists."))
        }
        const company = await dbService.create({
            model: companyModel,
            data: {
                companyName,
                companyEmail,
                approvedByAdmin: false,
                CreatedBy: req.user._id
            }
        })
        return successResponse({ res, data: { company } })
    }
)
export const banCompany = asyncHandler(
    async (req, res, next) => {
        const { action } = req.query
        const { companyId } = req.params
        if (req.user.role !== roleTypes.admin) {
            return next(new Error("Unauthorized: Only admins can ban/unban Company"));
        }
        const data = action?.toString() === "ban" ? { isBanned: true, bannedAt: new Date() } : { isBanned: false, bannedAt: 0 }
        const company = await dbService.findOneAndUpdate({
            model: companyModel,
            filter: { _id: companyId },
            data,
            options: { new: true }
        })
        console.log(company);
        if (!company) {
            return next(new Error("Company not found"));
        }

        return successResponse({ res, data: { company } })
    }
)
export const approveCompany = asyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params

        if (req.user.role !== roleTypes.admin) {
            return next(new Error("Unauthorized: Only admins can ban/unban Company"));
        }

        const company = await dbService.findOne({
            model: companyModel,
            filter: { _id: companyId },
        })
        console.log(company);
        if (!company) {
            return next(new Error("Company not found"));
        }
        if (company.approvedByAdmin) {
            return next(new Error("Company is already approved"));
        }
        const updatedCompany = await dbService.findByIdAndUpdate({
            model: companyModel,
            filter: { _id: companyId },
            data: { isApproved: true, approvedAt: new Date() },
            options: { new: true },
        })

        return successResponse({
            res, message: "Company has been approved successfully",
            data: { company: updatedCompany },
        })
    }
)
export const addHRToCompany = asyncHandler(async (req, res, next) => {
    const { companyId, hrId } = req.body;
    const userId = req.user._id;

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId }
    });

    if (!company) {
        return next(new Error("Company not found"));
    }

    if (company.CreatedBy.toString() !== userId.toString()) {
        return next(new Error("You do not have permission to add HRs"));
    }

    const hrUser = await dbService.findOne({
        model: userModel,
        filter: { _id: hrId }
    });
    if (!hrUser) {
        return next(new Error("HR user not found"));
    }
    const updatedCompany = await dbService.findByIdAndUpdate({
        model: companyModel,
        id: companyId,
        data: { $addToSet: { HRs: hrId } },
        options: { new: true }
    });
    return successResponse({ res, data: { updatedCompany } });
});


export const updateCompany = asyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params
        const company = await dbService.findOne({
            model: companyModel,
            filter: {
                _id: companyId
            },
        })
        if (!company) {
            return next(new Error("In-Valid id Or Not Found."))

        }
        const { companyName, companyEmail } = req.body;
        const updatedCompany = await dbService.updateOne({
            model: companyModel,
            filter: {
                _id: companyId
            },
            data: { companyName, companyEmail }
        })
        return successResponse({ res, data: { updatedCompany: company } })
    }
)



export const freezeCompany = asyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params;
        const userId = req.user._id;

        const company = await dbService.findOne({
            model: companyModel,
            filter: { _id: companyId, }
        });
        if (!company) {
            return next(new Error("Company not found"));
        }
        if (company.CreatedBy.toString() !== userId.toString() && req.user.role !== roleTypes.admin) {
            return next(new Error("u do not have permission to delete this company"));
        }
        if (company.isDeleted) {
            return next(new Error("Company is already Deleted"));
        }
        const updatedCompany = await dbService.findByIdAndUpdate({
            model: companyModel,
            id: companyId,
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
            options: { new: true }
        });
        return successResponse({ res, message: "Company Freeze successfully." });
    }
);

export const unFreezeCompany = asyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params;
        const userId = req.user._id;

        const company = await dbService.findById({
            model: companyModel,
            id: companyId,
        });
        if (!company) {
            return next(new Error("Company not found"));
        }
        if (company.CreatedBy.toString() !== userId.toString() && req.user.role !== roleTypes.admin) {
            return next(new Error("u do not have permission to delete this company"));
        }
        if (!company.isDeleted) {
            return next(new Error("Company is already active"));

        }
        const updatedCompany = await dbService.findByIdAndUpdate({
            model: companyModel,
            id: companyId,
            data: {
                $unset: { isDeleted: 1, deletedAt: 1 },
            },
            options: { new: true }
        });

        return successResponse({ res, message: "Account unFreeze successfully." });
    }
);

export const specificCompany = asyncHandler(
    async (req, res, next) => {
        const { companyId } = req.params;

        const company = await dbService.findById({
            model: companyModel,
            id: companyId,
            populate: ['job']
        });

        if (!company) {
            return next(new Error("Company not found"));
        }

        return successResponse({ res, data: { company, jobs: company.job } });
    }
);

export const searchCompanyName = asyncHandler(
    async (req, res, next) => {
        const { companyName } = req.body;

        const company = await dbService.findOne({
            model: companyModel,
            filter: { companyName },
        });

        console.log(company);

        if (!company) {
            return next(new Error("Company Name not found"));
        }

        return successResponse({ res, data: { company } });
    }
);

export const uploadLogo = asyncHandler(
    async (req, res, next) => {
        const { logoPicId } = req.params
        if (!req.file) {
            return next(new Error("No file uploaded"));
        }
        const company = await dbService.findById({
            model: companyModel,
            id: logoPicId
        });

        if (!company) {
            return next(new Error("Company not found"));
        }
        const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `LogoPic/${req.user._id}` })

        const logoPicture = await dbService.findByIdAndUpdate({
            model: companyModel,
            id: logoPicId,
            data: {
                Logo: { secure_url, public_id }
            },
            options: { new: true }
        })

        if (logoPicture.Logo?.puplic_id) {
            await cloud.uploader.destroy(logoPicture.Logo.puplic_id)
        }
        return successResponse({ res, data: { logoPicture } });
    }
);

export const deleteLogo = asyncHandler(
    async (req, res, next) => {
        const { logoPicId } = req.params

        const logoPicture = await dbService.findById({
            model: companyModel,
            id: logoPicId,
        })
        if (!logoPicture) {
            return next(new Error("Logo not found"));
        }
        if (logoPicture.Logo && logoPicture.Logo.puplic_id) {
            await cloud.uploader.destroy(logoPicture.Logo.puplic_id)
        }
        await dbService.findByIdAndUpdate({
            model: companyModel,
            id: logoPicId,
            data: { $unset: { Logo: 1 } },
            options: { new: true }
        })
        return successResponse({ res, message: "Profile Picture Is Deleted Successfully." })
    }
)
export const uploadCoverPic = asyncHandler(
    async (req, res, next) => {
        const { coverPicId } = req.params
        if (!req.files || req.files.length === 0) {
            return next(new Error("No files uploaded"));
        }
        const company = await dbService.findById({
            model: companyModel,
            id: coverPicId,
        });

        if (!company) {
            return next(new Error("Company not found"));
        }
        if (company.coverPic && company.coverPic.length > 0) {
            for (const image of company.coverPic) {
                if (image.public_id) {
                    try {
                        await cloud.uploader.destroy(image.public_id);
                    } catch (error) {
                        console.error(`Failed to delete old cover image: ${image.public_id}`, error);
                    }
                }
            }
        }
        const images = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `coverPic/${req.user._id}` })
            images.push({ secure_url, public_id })
        }
        const coverPicture = await dbService.findByIdAndUpdate({
            model: companyModel,
            id: coverPicId,
            data: {
                coverPic: images
            },
            options: { new: true }
        })
        return successResponse({ res, data: { files: req.files, coverPicture } })
    }
)

export const deleteCoverPic = asyncHandler(
    async (req, res, next) => {
        const { coverPicId } = req.params
        const user = await dbService.findOne({
            model: companyModel,
            filter: { _id: coverPicId, }
        })
        if (!user.coverPic || user.coverPic.length === 0) {
            return next(new Error("No Cover Pictures To Deleted"));
        }
        for (const pic of user.coverPic) {
            await cloud.uploader.destroy(pic.public_id)
        }
        await dbService.findByIdAndUpdate({
            model: companyModel,
            id: coverPicId,
            data: { coverPic: [] },
            options: { new: true }
        })
        return successResponse({ res, message: "Cover Picture Is Deleted Successfully." })
    }
)