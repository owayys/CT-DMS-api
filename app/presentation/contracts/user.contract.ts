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

export const userContract = oc.prefix("/user").router({
    create: oc
        .route({
            method: "POST",
            path: "/",
            summary: "Create a new user (Sign up)",
        })
        .input(CreateUserRequestSchema)
        .output(BaseResponse.merge(UserResponseSchema).or(ErrorResponse)),
    get: oc
        .route({
            method: "GET",
            path: "/:id",
            summary: "Get a user by ID",
        })
        .input(GetUserRequestSchema)
        .output(BaseResponse.merge(UserResponseSchema).or(ErrorResponse)),
    getAll: oc
        .route({
            method: "GET",
            path: "/",
            summary: "Get all users (Paginated)",
        })
        .input(GetAllUsersRequestSchema)
        .output(AllUsersResponse),
    update: oc
        .route({
            method: "PUT",
            path: "/:id",
            summary: "Update user password by ID",
        })
        .input(UpdateUserRequestSchema)
        .output(UpdateResponse),
});
