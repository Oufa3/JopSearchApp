import path from "node:path"

import connectDB from "./DB/connection.js"
import authController from "./modules/auth/auth.controller.js"
import chatController from "./modules/chat/chat.controller.js"
import companyController from "./modules/company/company.controller.js"
import jobController from "./modules/job/job.controller.js"
import userController from "./modules/user/user.controller.js"
import { globalErrorHandling } from "./utlis/response/error.response.js"
import cors from "cors"
import { createHandler } from "graphql-http/lib/use/express"
import { graphql } from "graphql"
import { schema } from "./modules/modules.schema.js"

const bootstrap = (app, express) => {
    console.log(path.resolve("./src/uploads"));
    // console.log();


    var whitelist = process.env.ORIGIN.split(",") || []
    // app.use(async (req, res, next) => {
    //     console.log(req.header("origin"))
    //     console.log(req.method);


    //     if (!whitelist.includes(req.header("origin"))) {
    //         return next(new Error("Not Allowed By Cors", { status: 403 }))
    //     }
    //     if (!["GET", "POST", "OPTIONS"].includes(req.method)) {
    //         return next(new Error("Not Allowed By Cors", { status: 403 }))
    //     }
    //     await res.header("Access-Control-Allow-Origin", req.header("origin"))
    //     await res.header("Access-Control-Allow-Headers", "*")
    //     await res.header("Access-Control-Allow-Private-Network", "true")
    //     await res.header("Access-Control-Allow-Methods", "*")
    //     console.log("Origin Work");
    //     next()
    // });
    app.use(cors())
    app.use(express.json())







    app.use("/uploads", express.static(path.resolve("./src/uploads")))
    app.get('/', (req, res) => res.send("Welcome In Node.Js Project Powerd By Express And ES6"))

    app.use("/graphql", createHandler({ schema }))
    app.use("/auth", authController)
    app.use("/chat", chatController)
    app.use("/company", companyController)
    app.use("/job", jobController)
    app.use("/user", userController)

    app.all('*', (req, res) => {
        return res.status(404).json({ message: "in-Valid Routing" })
    })

    app.use(globalErrorHandling)

    // DB
    connectDB()
}


export default bootstrap