import { z } from "zod";

export const UserEntitySchema = z.object({
    userName: z.string(),
    role: z.enum(["USER", "ADMIN"]),
    password: z.string(),
    // .refine(
    //     (value) =>
    //         /^\$2[aby]?\$\d{1,2}\$[.\/A-Za-z0-9]{53}$/.test(value ?? ""),
    //     "Password should be a bcrypt hash"
    // ),
});
