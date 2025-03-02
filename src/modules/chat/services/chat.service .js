import * as dbService from "../../../DB/db.Service.js"
import { chatModel } from "../../../DB/model/Chat.model.js"
import { asyncHandler } from "../../../utlis/response/error.response.js"
import { successResponse } from "../../../utlis/response/success.response.js"


export const findOneChat = asyncHandler(
    async (req, res, next) => {
        const { destId } = req.params
        const chat = await dbService.findOne({
            model: chatModel,
            filter: {
                $or: [
                    { senderId: req.user._id, receiverId: destId },
                    { senderId: destId, receiverId: req.user._id }
                ]
            }, populate: [
                { path: "senderId" },
                { path: "receiverId" },
                { path: "messages.senderId" }
            ]
        })
        return successResponse({ res, data: { chat } })
    }
)