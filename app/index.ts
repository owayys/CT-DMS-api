import express, { Express, Request, Response } from "express";
import "dotenv/config";
import "reflect-metadata";

import "./lib/di"; // DI container

import fileUpload from "express-fileupload";

import userRouter from "./routes/user.route";
import jwtRouter from "./routes/jwt.route";
import documentRouter from "./routes/document.route";
import { logRequests } from "./middleware/logRequests";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(logRequests);
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
