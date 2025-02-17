import { z } from "zod";

export const AuthResponse = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});
