import { Server } from "socket.io"
import path from 'node:path'
import * as dotenv from "dotenv"
dotenv.config({ path: path.resolve("./src/config/.env.prod") })
// console.log({ path: path.resolve("./srs/config/.env.dev") });
import chalk from 'chalk'

import express from 'express'
import bootstrap from './src/app.controller.js'
import { authenticationSocket } from "./src/middleware/auth.socket.middleware.js"
import { socketConnections } from "./src/DB/model/user.model.js"
import { runIo } from "./src/modules/chat/chat.socket.controller.js"
const app = express()
const PORT = process.env.PORT || 3000

bootstrap(app, express)



const httpServer = app.listen(PORT, () => console.log(chalk.bgBlue(`Example app listening on port ${PORT}!`)))

runIo(httpServer)
