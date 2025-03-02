import { asyncHandler } from "../../../utlis/response/error.response.js"
import { successResponse } from "../../../utlis/response/success.response.js";
import { compareHash, generateHash } from "../../../utlis/security/hash.security.js";
import * as dbService from "../../../DB/db.Service.js"
import { userModel } from "../../../DB/model/user.model.js";
import { emailEvent } from "../../../utlis/events/email.events.js";



export const signup = asyncHandler(
    async (req, res, next) => {
        const { username, email, password, mobileNumber } = req.body;
        if (await dbService.findOne({ model: userModel, filter: { email } })) {
            return next(new Error("Email Exist", { cause: 409 }))
        }
        const user = await dbService.create({
            model: userModel,
            data: { username, email, password, mobileNumber },
        })
        emailEvent.emit("sendConfirmEmail", { email })
        return successResponse({ res, status: 201, data: { user } })
    }
)
export const confirmOTP = asyncHandler(
    async (req, res, next) => {
        const { email, code } = req.body;
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (!user) {
            return next(new Error("Email Not Exist", { cause: 404 }))
        }
        if (user.isConfirmed) {
            return next(new Error("Email Already Confirmed", { cause: 409 }))

        }
        const otp = user.OTP.find(otpEntry => otpEntry.type === 'confirmEmail');
        if (!otp) {
            return next(new Error("OTP Not Exist", { cause: 400 }));
        }
        const currentDate = new Date()
        if (currentDate > otp.expiresIn) {
            return next(new Error("The OTP has expired", { cause: 400 }));
        }
        if (!compareHash({ plainText: `${code}`, hashValue: otp.code })) {
            return next(new Error("In-Valid Code", { cause: 400 }))
        }
        if (otp.type === "confirmEmail") {
        }
        await dbService.updateOne({
            model: userModel,
            filter: { email },
            data: { isConfirmed: true, $unset: { OTP: 1 } },
            options: { new: true }
        })
        return successResponse({ res, status: 200, data: { message: "Email successfully confirmed" } });
    }
)
