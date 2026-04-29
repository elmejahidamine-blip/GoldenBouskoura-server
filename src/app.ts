import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { clerkWebhook } from "./controllers/clerkWebhook";
import rootRouter from "./routes";

const app = express();

if (process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
} else {
  console.warn("Clerk middleware disabled because CLERK_SECRET_KEY is not set.");
}

app.use(cors());
app.post(["/api/clerk", "/api/webhooks/clerk", "/api/clerk/webhook"], express.raw({ type: "application/json" }), clerkWebhook);
app.use(express.json());
app.use("/", rootRouter);

export default app;
