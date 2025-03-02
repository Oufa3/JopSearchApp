import jwt from "jsonwebtoken";
import * as dbService from "../../DB/db.Service.js"
import { userModel } from "../../DB/model/user.model.js";


export const tokenTypes = {
    access: "access",
    refresh: "refresh"
}

export const decodeToken = async ({ authorization = "", tokenType = tokenTypes.access, next } = {}) => {
    // const { authorization } = req.headers
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        return next(new Error("authorization id requird or in-valid formate", { cause: 400 }))
    }
    let accessSignature = ""
    let refreshSignature = ""
    switch (bearer) {
        // access_Token
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
        return next(new Error("Invalid Token payload", { cause: 401 }))
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: decoded.id, isDeleted: { $exists: false } }
    })
    if (!user) {
        return next(new Error("in-valid account", { cause: 404 }))
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        return next(new Error("in-valid credentials", { cause: 400 }))
    }
    return user
}

export const generateToken = ({
    payload = {},
    signature = process.env.USER_ACCESS_TOKEN,
    expiresIn = parseInt(process.env.expiresIn)
} = {}) => {
    const token = jwt.sign(payload, signature, { expiresIn })
    return token
}

export const verfiyToken = ({ token = "", signature = process.env.USER_ACCESS_TOKEN } = {}) => {
    const decoded = jwt.verify(token, signature)
    return decoded
}
