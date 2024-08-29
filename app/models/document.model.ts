import { randomUUID } from "crypto";
import mongoose, { mongo } from "mongoose";

const documentSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: randomUUID,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileExtension: String,
    contentType: String,
    tags: [
        {
            key: String,
            name: String,
        },
    ],
    content: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

documentSchema.pre("save", async function (next) {
    this.updatedAt = new Date();
    next();
});

export const Document = mongoose.model("Document", documentSchema);
