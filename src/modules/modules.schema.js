import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import * as companyResolver from "./company/services/company.resolver.js";
import * as userResolver from "./user/resolver/user.resolver.js";


export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "mainSchemaQuery",
        description: " THIS QUERY ICLUDE ALL PROJECT GRAPHQL ENDPOINT",
        fields: {
            ...companyResolver,
            ...userResolver,
        }
    })
})