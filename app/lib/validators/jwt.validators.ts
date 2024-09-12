import { z } from "zod";

export const JwtResponse = z.object({
    accessToken: z.string({
        required_error: "Access Token is required",
    }),
    refreshToken: z.string({
        required_error: "Refresh Token is required",
    }),
});

export const JwtRefreshResponse = JwtResponse.pick({
    accessToken: true,
});

export const JwtRequestUser = z.object({
    body: z.object({
        userName: z.string({
            required_error: "User Name is required",
        }),
        password: z.string({
            required_error: "Password is required",
        }),
    }),
});
