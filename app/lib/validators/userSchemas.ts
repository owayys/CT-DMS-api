import { z } from "zod";

export const User = z.object({
    Id: z
        .string({
            required_error: "User ID is required",
        })
        .uuid(),
    userName: z.string({
        required_error: "User Name is required",
    }),
    password: z.string({
        required_error: "Password is required",
    }),
    userRole: z.enum(["ADMIN", "USER"]),
    createdAt: z.coerce.date().or(z.string()),
    updatedAt: z.coerce.date().or(z.string()),
});

export const GetUser = z.object({
    params: z.object({
        id: z
            .string({
                required_error: "User ID is required",
            })
            .uuid(),
    }),
});

export const GetAllUsers = z.object({
    query: z.object({
        pageNumber: z.coerce
            .number()
            .min(1, "Page Number must be 1 or greater")
            .optional(),
        pageSize: z.coerce
            .number()
            .min(1, "Page Number must be 1 or greater")
            .optional(),
    }),
});

export const CreateUser = z.object({
    body: z.object({
        userName: z.string({
            required_error: "User Name is required",
        }),
        password: z.string({
            required_error: "Password is required",
        }),
    }),
});

export const UpdateUser = z.object({
    params: z.object({
        id: z
            .string({
                required_error: "User ID is required",
            })
            .uuid(),
    }),
    body: z.object({
        password: z.string({
            required_error: "Password is required",
        }),
    }),
});

export const DeleteUser = z.object({
    params: z.object({
        id: z
            .string({
                required_error: "User ID is required",
            })
            .uuid(),
    }),
});

export const UserResponse = z.object({
    Id: z.string().uuid(),
    userName: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export const AllUsersResponse = UserResponse.array();
