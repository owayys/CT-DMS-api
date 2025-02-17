import { oc } from "@orpc/contract";
import { LoginRequestSchema } from "../../application/dtos/auth/schemas/login.request.schema";
import { AuthResponse } from "../../application/dtos/auth/schemas/auth.response.schema";
import { ErrorResponse } from "../../lib/validators/common";
import { z } from "zod";

export const authContract = oc.prefix("/auth").router({
    generate: oc
        .route({
            method: "POST",
            path: "/",
            summary: "Generate Access tokens (Login)",
            inputStructure: "detailed",
        })
        .input(z.object({ body: LoginRequestSchema }))
        .output(AuthResponse.or(ErrorResponse)),
    refresh: oc
        .route({
            method: "POST",
            path: "/refresh",
            summary: "Refresh access token",
            inputStructure: "detailed",
        })
        .input(
            z.object({
                headers: z.object({
                    authorization: z.string(),
                }),
            })
        )
        .output(AuthResponse.omit({ refreshToken: true }).or(ErrorResponse)),
});
