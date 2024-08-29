import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import userRouter from "./routes/user.route";
import jwtRouter from "./routes/jwt.route";
import documentRouter from "./routes/document.route";

dotenv.config({
    path: "./.env",
});

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(morgan("dev"));
app.use(express.json());
app.use(fileUpload());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/jwt", jwtRouter);
app.use("/api/v1/document", documentRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
