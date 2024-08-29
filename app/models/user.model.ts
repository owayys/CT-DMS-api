import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: randomUUID,
    },
    userName: {
        type: String,
        unique: true,
    },
    userRole: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", async function (next) {
    this.updatedAt = new Date();
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
