// src/app.ts
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { clerkWebhook } from "./controllers/clerkWebhook";
import rootRouter from "./routes";

const app = express();

// ✅ Webhook avec express.json() (Vercel parse déjà le body)
app.post(
  ["/api/clerk", "/api/webhooks/clerk", "/api/clerk/webhook"],
  express.json(),
  clerkWebhook
);

// Middlewares globaux
app.use(cors());
app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", rootRouter);

export default app;