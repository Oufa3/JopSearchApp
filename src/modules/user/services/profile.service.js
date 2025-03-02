import { asyncHandler } from "../../../utlis/response/error.response.js"
import * as dbService from "../../../DB/db.Service.js"
import { roleTypes, userModel } from "../../../DB/model/user.model.js"
import { successResponse } from "../../../utlis/response/success.response.js"
import { compareEncryptPhone, generateEncryptPhone } from "../../../utlis/security/encryption.security.js"
import { compareHash, generateHash } from "../../../utlis/security/hash.security.js"
import cloud from "../../../utlis/multer/cloudinary.js";




export const updateBasicProfile = asyncHandler(
    async (req, res, next) => {
        const { mobileNumber } = req.body
        const encyptPhone = generateEncryptPhone({ phone: mobileNumber })

        const updateData = {
            ...req.body,
            mobileNumber: encyptPhone,
        };

        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: updateData,
            options: { new: true }
        })
        // console.log(req.body);


        console.log(encyptPhone);


        return successResponse({ res, data: { user } })
    }
)
export const banUser = asyncHandler(
    async (req, res, next) => {
        const { action } = req.query
        const { userId } = req.params
        if (req.user.role !== roleTypes.admin) {
            return next(new Error("Unauthorized: Only admins can ban/unban users"));
        }
        const data = action?.toString() === "ban" ? { isBanned: true, bannedAt: new Date() } : { isBanned: false, bannedAt: null }
        const user = await dbService.findOneAndUpdate({
            model: userModel,
            filter: { _id: userId },
            data,
            options: { new: true }
        })
        if (!user) {
            return next(new Error("User not found"));
        }


        return successResponse({ res, data: { user } })
    }
)

export const addFriend = asyncHandler(
    async (req, res, next) => {
        const { friendId } = req.params


        const friend = await dbService.findOneAndUpdate({
            model: userModel,
            filter: { _id: friendId, isDeleted: { $exists: false } },
            data: { $addToSet: { friends: req.user._id } },
            options: {
                new: false
            },
        })
        if (!friend) {
            return next(new Error("in-valid accountId", { cause: 404 }));
        }
        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                $addToSet: { friends: friendId }
            },
            options: {
                new: false
            },
        })

        return successResponse({ res })
    }
)

export const getProfile = asyncHandler(
    async (req, res, next) => {

        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: req.user._id },
        })
        if (!user) {
            return next(new Error("User not found", { cause: 404 }));
        }
        const encyptPhone = compareEncryptPhone({ phone: user.mobileNumber })
        user.mobileNumber = encyptPhone
        return successResponse({ res, data: { user } })
    }
)

export const shareProfile = asyncHandler(
    async (req, res, next) => {
        const { profileId } = req.params


        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: profileId },
            select: "firstName lastName username  mobileNumber profilePic coverPic "
        })

        if (!user) {
            return next(new Error("in-valid user ", { cause: 404 }));
        }

        const encyptPhone = compareEncryptPhone({ phone: user.mobileNumber })
        user.mobileNumber = encyptPhone
        console.log(encyptPhone);


        return successResponse({ res, data: { user } })
    }
)

export const updatePassword = asyncHandler(
    async (req, res, next) => {
        const { oldPassword, password } = req.body
        if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
            return next(new Error("In-valid old password", { cause: 400 }))
        }
        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                password: generateHash({ plainText: password }),
                changeCredentialsTime: Date.now()
            },
            options: { new: true }
        })
        return successResponse({ res, data: { user } })
    }
)
export const uploadProfilePic = asyncHandler(
    async (req, res, next) => {
        const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `profilePic/${req.user._id}` })
        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                profilePic: { secure_url, public_id }
            },
            options: { new: true }
        })
        if (user.profilePic?.puplic_id) {
            await cloud.uploader.destroy(user.profilePic.puplic_id)
        }
        return successResponse({ res, data: { file: req.file, user } })
    }
)
export const deleteProfilePic = asyncHandler(
    async (req, res, next) => {
        const user = await dbService.findById({
            model: userModel,
            id: req.user._id,
        })
        if (user.profilePic && user.profilePic.puplic_id) {
            await cloud.uploader.destroy(user.profilePic.puplic_id)
        }
        await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: { $unset: { profilePic: 1 } },
            options: { new: true }
        })
        return successResponse({ res, message: "Profile Picture Is Deleted Successfully." })
    }
)
export const uploadCoverPic = asyncHandler(
    async (req, res, next) => {
        const images = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `coverPic/${req.user._id}` })
            images.push({ secure_url, public_id })
        }
        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                coverPic: images
            },
            options: { new: true }
        })
        return successResponse({ res, data: { files: req.files, user } })
    }
)
export const deleteCoverPic = asyncHandler(
    async (req, res, next) => {

        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: req.user._id, }
        })
        if (!user.coverPic || user.coverPic.length === 0) {
            return next(new Error("No Cover Pictures To Deleted"));
        }
        for (const pic of user.coverPic) {
            await cloud.uploader.destroy(pic.public_id)
        }
        await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: { coverPic: [] },
            options: { new: true }
        })
        return successResponse({ res, message: "Cover Picture Is Deleted Successfully." })
    }
)
export const freezeAccount = asyncHandler(
    async (req, res, next) => {
        const user = await dbService.findOneAndUpdate({
            model: userModel,
            filter: {
                _id: req.user._id,
                deletedAt: null
            },
            options: { new: true },
            data: { deletedAt: Date.now() },
        })
        return successResponse({ res, message: "Account Freeze successfully.  To unFreeze Account Login" })
    }
)
