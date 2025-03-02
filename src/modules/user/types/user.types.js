import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { genderTypes, providerTypes, roleTypes } from "../../../DB/model/user.model.js"
import * as dbService from "../../../DB/db.Service.js"




export const userType = new GraphQLObjectType({
    name: "userType",
    fields: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        forgetPasswordOTP: { type: GraphQLString },
        provider: {
            type: new GraphQLEnumType({
                name: "providerOptions",
                values: {
                    google: { value: providerTypes.google },
                    system: { value: providerTypes.system }
                }
            })
        },
        gender: {
            type: new GraphQLEnumType({
                name: "genderOptions",
                values: {
                    male: { value: genderTypes.male },
                    female: { value: genderTypes.female }
                }
            })
        },
        DOB: { type: GraphQLString },
        mobileNumber: { type: GraphQLString },
        role: {
            type: new GraphQLEnumType({
                name: "roleOptions",
                values: {
                    user: { value: roleTypes.user },
                    admin: { value: roleTypes.admin }
                }
            })
        },
        isConfirmed: { type: GraphQLBoolean },
        isDeleted: { type: GraphQLBoolean },
        deletedAt: { type: GraphQLString },
        bannedAt: { type: GraphQLString },
        updatedBy: { type: GraphQLString },
        changeCredentialsTime: { type: GraphQLString },
        profilePic: {
            type: new GraphQLObjectType({
                name: "profilePicType",
                fields: {
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                }
            })
        },
        coverPic: {
            type: new GraphQLList(new GraphQLObjectType({
                name: "coverPiceType",
                fields: {
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                }
            }))
        },
        forgetpasswordOTP: { type: GraphQLString },
        attemptCount: { type: GraphQLInt }, 
        otpExpiresAt: { type: GraphQLString },
        blockUntil: { type: GraphQLString },
    }
})




export const userList = new GraphQLList(userType)
export const profileListResponse = new GraphQLObjectType({
    name: "profileListResponse",
    fields: {
        statusCode: { type: GraphQLInt },
        message: { type: GraphQLString },
        data: { type: userList },
    }
})