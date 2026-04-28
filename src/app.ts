import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import rootRouter from "./routes";

const app = express();

app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());
app.use("/", rootRouter);

export default app;
