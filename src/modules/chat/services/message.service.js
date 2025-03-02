





export const sendMessage = (socket) => {
    return socket.on("sendMessage", async (data) => {
        const { destId, message } = data
        // if (!data.valid) {
        //     return socket.emit("socketErrorResponse", data)
        // }
        console.log({ destId, message });

    })
}