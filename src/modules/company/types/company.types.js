import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"



export const companyType = new GraphQLObjectType({
    name: "companyType",
    fields: {
        companyName: { type: GraphQLString },
        description: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: GraphQLString },
        numberOfEmployees: { type: GraphQLInt },
        companyEmail: { type: GraphQLString },
        CreatedBy: { type: GraphQLID },
        Logo: {
            type: new GraphQLObjectType({
                name: "logoType",
                fields: {
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                }
            })
        },
        coverPic: {
            type: new GraphQLList(new GraphQLObjectType({
                name: "coverPicType",
                fields: {
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                }
            }))
        },
        userId: { type: new GraphQLList(GraphQLID) },
        HRs: { type: new GraphQLList(GraphQLID) },
        bannedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
        legalAttachment: {
            type: new GraphQLObjectType({
                name: "legalAttachmentType",
                fields: {
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                }
            })
        },
        approvedByAdmin: { type: GraphQLBoolean },
    }
})

export const companyList = new GraphQLList(companyType)
export const companyListResponse = new GraphQLObjectType({
    name: "companyListResponse",
    fields: {
        statusCode: { type: GraphQLInt },
        message: { type: GraphQLString },
        data: { type: companyList },
    }
})