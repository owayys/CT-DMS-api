import { z } from "zod";

export const LoginRequestSchema = z.object({
    userName: z.string(),
    password: z.string(),
});
