import { userModel } from "../../../DB/model/user.model.js"
import * as userTypes from "../types/user.types.js"
import * as dbService from "../../../DB/db.Service.js"



export const profileList = {
    type: userTypes.profileListResponse,
    resolve: async (parent, args) => {
        const user = await dbService.findAll({ model: userModel })
        return { statusCode: 200, message: "Done", data: user }
    }
}