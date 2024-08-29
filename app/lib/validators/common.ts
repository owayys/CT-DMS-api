import { z } from "zod";

export const UpdateResponse = z.object({
    success: z.boolean(),
});

export const DeleteResponse = UpdateResponse;
