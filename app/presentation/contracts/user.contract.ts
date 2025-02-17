import { oc } from "@orpc/contract";
import {
    BaseResponse,
    ErrorResponse,
    UpdateResponse,
} from "../../lib/validators/common";
import { UpdateUserRequestSchema } from "../../application/dtos/user/schemas/update-user.request.schema";
import { GetUserRequestSchema } from "../../application/dtos/user/schemas/get-user.request.schema";
import { CreateUserRequestSchema } from "../../application/dtos/user/schemas/create-user.request.schema";
import { UserResponseSchema } from "../../application/dtos/user/schemas/user.response.schema";
import { AllUsersResponse } from "../../lib/validators/user.validators";
import { GetAllUsersRequestSchema } from "../../application/dtos/user/schemas/get-all-users.request.schema";
import { z } from "zod";

export const userContract = oc.prefix("/user").router({
    create: oc
        .route({
            method: "POST",
            path: "/",
            summary: "Create a new user (Sign up)",
            inputStructure: "detailed",
        })
        .input(z.object({ body: CreateUserRequestSchema }))
        .output(BaseResponse.merge(UserResponseSchema).or(ErrorResponse)),
    get: oc
        .route({
            method: "GET",
            path: "/{id}",
            summary: "Get a user by ID",
            inputStructure: "detailed",
        })
        .input(z.object({ params: GetUserRequestSchema }))
        .output(BaseResponse.merge(UserResponseSchema).or(ErrorResponse)),
    getAll: oc
        .route({
            method: "GET",
            path: "/",
            summary: "Get all users (Paginated)",
            inputStructure: "detailed",
        })
        .input(
            z.object({
                query: GetAllUsersRequestSchema.pick({
                    pageNumber: true,
                    pageSize: true,
                }),
            })
        )
        .output(AllUsersResponse),
    update: oc
        .route({
            method: "PUT",
            path: "/{id}",
            summary: "Update user password by ID",
            inputStructure: "detailed",
        })
        .input(
            z.object({
                params: UpdateUserRequestSchema.pick({ id: true }),
                body: UpdateUserRequestSchema.pick({ password: true }),
            })
        )
        .output(UpdateResponse),
});
