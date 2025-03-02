import { asyncHandler } from "../utlis/response/error.response.js";
import { decodeToken, tokenTypes, verfiyToken } from "../utlis/security/token.security.js";
import * as dbService from "../DB/db.Service.js"
import { userModel } from "../DB/model/user.model.js";

export const authenticationSocket = async ({ socket = {}, tokenType = tokenTypes.access } = {}) => {
    const [bearer, token] = socket.handshake?.auth?.authorization?.split(" ") || []
    if (!bearer || !token) {
        return { data: { message: "authorization id requird or in-valid formate", status: 400 } }
        // return { data: { message: "authorization id requird or in-valid formate", status: 400 } }
    }
    let accessSignature = ""
    let refreshSignature = ""
    switch (bearer) {
        case "System":
            accessSignature = process.env.SYSTEM_ACCESS_TOKEN
            refreshSignature = process.env.SYSTEM_REFRESH_TOKEN
            break;
        case "Bearer":
            accessSignature = process.env.USER_ACCESS_TOKEN
            refreshSignature = process.env.USER_REFRESH_TOKEN
            break;
        default:
            break;
    }

    const decoded = verfiyToken({ token, signature: tokenType == tokenTypes.access ? accessSignature : refreshSignature })
    if (!decoded?.id) {
        return { data: { message: "Invalid Token payload", status: 401 } }
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: decoded.id, isDeleted: { $exists: false } }
    })
    if (!user) {
        return { data: { message: "in-valid account", status: 401 } }
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        return { data: { message: "in-valid credentials", status: 401 } }
    }
    // socketConnections.set(user._id.toString(), socket.id)
    return { data: { user, valid: true } }

}

export const authorization = async ({ accessRoles = [], role } = {}) => {
    if (!accessRoles.includes(role)) {
        throw new Error("Not authorized account")
    }
    return true
}