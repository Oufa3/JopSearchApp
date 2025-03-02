import { Server } from "socket.io"
import { logoutSocket, registerSocket } from "./services/chat.auth.service.js";
import { sendMessage } from "./services/message.service.js";






export const runIo = async (httpServer) => {

    const io = new Server(httpServer, {
        cors: "*"
    })



    return io.on("connection", async (socket) => {
        console.log(socket.handshake.auth);
        await registerSocket(socket)
        await sendMessage(socket)

        await logoutSocket(socket)

    })

}