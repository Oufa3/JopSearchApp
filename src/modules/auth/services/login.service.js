import { asyncHandler } from "../../../utlis/response/error.response.js";
import { successResponse } from "../../../utlis/response/success.response.js";
import * as dbService from "../../../DB/db.Service.js"
import { compareHash, generateHash } from "../../../utlis/security/hash.security.js";
import { otpTypes, providerTypes, roleTypes, userModel } from "../../../DB/model/user.model.js";
import { decodeToken, generateToken, tokenTypes } from "../../../utlis/security/token.security.js";
import { OAuth2Client } from 'google-auth-library'
import { emailEvent } from "../../../utlis/events/email.events.js";




export const login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body
        const user = await dbService.findOne({
            model: userModel,
            filter: { email }
        })
        if (!user) {
            return next(new Error("User Not Found", { cause: 404 }))
        }
        if (!user.isConfirmed) {
            return next(new Error("Please Confirm Email First ", { cause: 409 }))
        }
        if (user.deletedAt != null) {
            await dbService.findOneAndUpdate({
                model: userModel,
                filter: {
                    email
                },
                options: { new: true },
                data: { deletedAt: null },
            })
        }
        if (user.isDeleted) {
            return next(new Error("Account is Delete", { cause: 403 }));
        }
        if (user.provider != providerTypes.system) {
            return next(new Error("in-valid provider", { cause: 400 }))
        }
        if (!compareHash({ plainText: password, hashValue: user.password })) {
            return next(new Error("In-Valid Email Or Password", { cause: 400 }))
        }
        
        const access_Token = generateToken({ payload: { id: user._id }, signature: user.role == roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
        const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role == roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 604800 })

        return successResponse({
            res, status: 200, data: {
                token: {
                    access_Token,
                    refreshToken
                }
            }
        })
    }
)
export const signWithGmail = asyncHandler(
    async (req, res, next) => {
        const { idToken } = req.body
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.CLIENT_ID,
            });
            const payload = ticket.getPayload();
            return payload

        }
        const gmailData = await verify()
        const { email_verified, email, name, picture } = gmailData
        let user = await dbService.findOne({ model: userModel, filter: { email } })
        if (user?.provider == providerTypes.system) {
            return next(new Error("In-Valid Login Provider", { cause: 409 }))
        }
        if (!user) {
            user = await dbService.create({
                model: userModel, data: {
                    isConfirmed: email_verified,
                    email,
                    username: name,
                    image: picture,
                    provider: providerTypes.google
                }
            })
        }
        const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
        const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 31536000 })
        return successResponse({
            res, status: 200, data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }
        })
    }
)
export const loginWithGmail = asyncHandler(
    async (req, res, next) => {
        const { idToken } = req.body
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.CLIENT_ID,
            });
            const payload = ticket.getPayload();
            return payload

        }
        const gmailData = await verify()
        const { email_verified, email, name, picture } = gmailData
        let user = await dbService.findOne({ model: userModel, filter: { email } })
        if (user?.provider == providerTypes.system) {
            return next(new Error("In-Valid Login Provider", { cause: 409 }))
        }
        if (!user) {
            user = await dbService.create({
                model: userModel, data: {
                    isConfirmed: email_verified,
                    email,
                    username: name,
                    image: picture,
                    provider: providerTypes.google
                }
            })
        }

        const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
        const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 31536000 })

        return successResponse({
            res, status: 200, data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }
        })
    }
)


export const forgetPassword = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body
        const user = await dbService.findOne({
            model: userModel,
            filter: { email, deletedAt: null }
        })
        if (!user) {
            return next(new Error("in-valid account", { cause: 404 }))
        }
        emailEvent.emit("forgetpassword", { email })

        return successResponse({ res })
    }
)
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, password, code } = req.body;
    const checkUser = await userModel.findOne({ email });
    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }
    if (!compareHash({ plainText: code, hashValue: checkUser.forgetpasswordOTP })) {
        return next(new Error("code not match", { cause: 404 }));
    }
    const hashpassword = generateHash({ plainText: password })
    await userModel.updateOne({ email }, {
        password: hashpassword,
        isConfirmed: true,
        changeCredentialsTime: Date.now(),
        $unset: { forgetpasswordOTP: 0, otpExpiresAt: 0, attemptCount: 0 },

    })

    return successResponse({ res });
});

export const refreshToken = asyncHandler(
    async (req, res, next) => {
        const user = await decodeToken({ authorization: req.headers.authorization, tokenType: tokenTypes.refresh, next })
        const access_Token = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
        const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 31536000 })
        return successResponse({
            res, status: 200, data: {
                token: {
                    access_Token,
                    refreshToken
                }
            }
        })
    }
)