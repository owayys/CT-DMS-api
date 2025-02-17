import { pub } from "./orpc";
import { userRouter } from "./user.contract.route";
import { documentRouter } from "./document.contract.route";
import { authRouter } from "./auth.contract.route";

export const router = pub.router({
    user: userRouter,
    document: documentRouter,
    auth: authRouter,
});
