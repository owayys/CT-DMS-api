import express, { Express, Request, Response } from "express";
import "dotenv/config";
import "reflect-metadata";

import "./lib/di"; // DI container

import fileUpload from "express-fileupload";

import userRouter from "./presentation/routes/user.route";
import jwtRouter from "./presentation/routes/jwt.route";
import documentRouter from "./presentation/routes/document.route";
import { RequestLogger } from "./presentation/middleware/log-requests.middleware";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(new RequestLogger().logRequests);
app.use(express.json());
app.use(fileUpload());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/jwt", jwtRouter);
app.use("/api/v1/document", documentRouter);

app.get("/", (_: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.listen(port, () => {
    console.log(
        `\x1b[0m[server]: Server is running at http://localhost:${port}`
    );
});
