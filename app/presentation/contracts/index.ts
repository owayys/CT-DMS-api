import {
    oc,
    type InferContractRouterInputs,
    type InferContractRouterOutputs,
} from "@orpc/contract";
import { userContract } from "./user.contract";
import { documentContract } from "./document.contract";

export const contract = oc.router({
    user: userContract,
    document: documentContract,
});

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;
