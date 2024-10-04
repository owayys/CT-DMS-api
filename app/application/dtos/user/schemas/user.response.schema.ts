import { z } from "zod";

export const UserResponseSchema = z.object({
    userName: z.string(),
});
