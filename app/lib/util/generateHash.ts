import bcrypt from "bcrypt";
import { Result } from "./result";

export const generateHash = async (
    input: string
): Promise<Result<string, Error>> => {
    try {
        const salt = await bcrypt.genSalt(10);
        const output = await bcrypt.hash(input, salt);
        return new Result<string, Error>(output, null);
    } catch (err) {
        return new Result<string, Error>(null, err);
    }
};
