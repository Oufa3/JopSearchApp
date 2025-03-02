

import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import * as dbService from "../../../DB/db.Service.js"
import { companyModel } from "../../../DB/model/Company.model.js"
import * as companyTypes from "../types/company.types.js"



export const companyList = {
    type: companyTypes.companyListResponse,
    resolve: async (parent, args) => {
        const companys = await dbService.findAll({ model: companyModel })
        return {
            statusCode: 200, message: "Done", data: companys
        }
    }
}