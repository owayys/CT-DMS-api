import { z } from "zod";

export const CreateUserRequestSchema = z.object({
    userName: z.string(),
    password: z.string(),
});
