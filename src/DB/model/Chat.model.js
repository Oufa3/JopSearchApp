import mongoose, { model, Schema } from "mongoose";



export const chatSchema = new Schema({

    senderId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    messages: [
        {
            message: { type: String, required: true },
            senderId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
        }
    ]
}, {
    timestamps: true
})

export const chatModel = mongoose.models.Chat || model("Chat", chatSchema);
