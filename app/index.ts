import express, { Express, Request, Response } from "express";
import "dotenv/config";
import "reflect-metadata";

import "./lib/di"; // DI container

import fileUpload from "express-fileupload";

import userRouter from "./presentation/routes/user.route";
import authRouter from "./presentation/routes/auth.route";
import documentRouter from "./presentation/routes/document.route";
import { RequestLogger } from "./presentation/middleware/log-requests.middleware";
import { rateLimiter } from "./presentation/middleware/rate-limit.middleware";
import Redis from "ioredis";

import { AppContext } from "./presentation/middleware/types.middleware";

import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";

import { router } from "./presentation/routes";

import { ZodToJsonSchemaConverter } from "@orpc/zod";

const app: Express = express();
const port = process.env.PORT || 3000;

const rpcHandler = new RPCHandler(router, {
    interceptors: [
        onError((error: any) => {
            console.error(error);
        }),
    ],
});

const openAPIHandler = new OpenAPIHandler(router, {
    interceptors: [
        onError((error: any) => {
            console.error(error);
        }),
    ],
});

const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
});

app.use(new RequestLogger().logRequests);

const redisStore = new Redis(
    parseInt(process.env.REDIS_PORT!),
    process.env.REDIS_HOST!
);

await redisStore.flushdb();

const limiter = rateLimiter({
    windowMs: 5 * 60,
    limit: 100,
    store: redisStore,
});

app.use(limiter);

app.use("/rpc/*", async (req, res) => {
    const { headers, query, params } = req;

    const { matched } = await rpcHandler.handle(req, res, {
        prefix: "/rpc",
        context: { ...req, headers, query, params } as AppContext,
    });

    if (matched) {
        return;
    }
});

app.use(express.json());

app.use("/api/v1/*", async (req, res) => {
    const { headers, query, params } = req;

    const { matched } = await openAPIHandler.handle(req, res, {
        prefix: "/api/v1",
        context: { ...req, headers, query, params } as AppContext,
    });

    if (matched) {
        return;
    }
});

app.get("/spec.json", async (req, res) => {
    const spec = await openAPIGenerator.generate(router, {
        info: {
            title: "Headless Document Management System",
            version: "1.0.0",
        },
        servers: [{ url: "/api" }],
        security: [{ bearerAuth: [] }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                },
            },
        },
    });

    res.json(spec);
});

app.use(
    fileUpload({
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/document", documentRouter);

app.get("/", (_: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.listen(port, () => {
    console.log(
        `\x1b[0m[server]: Server is running at http://localhost:${port}`
    );
});
