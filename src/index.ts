// src/index.ts
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');  // ← DOIT ÊTRE TOUT EN HAUT, AVANT TOUT

import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";

const port = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    // Ne quitte pas — laisse Vercel gérer
  }

  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

void startServer();

const allowStartupWithoutMongo =
  process.env.ALLOW_START_WITHOUT_MONGODB === "true" ||
  process.env.ALLOW_START_WITHOUT_MONGODB === "1";

function logMongoConnectionError(error: unknown, level: "error" | "warn" = "error"): void {
  const logger = level === "warn" ? console.warn : console.error;

  if (!(error instanceof Error)) {
    logger("MongoDB connection failed", error);
    return;
  }

  logger("MongoDB connection failed");
  logger(`Name: ${error.name}`);
  logger(`Message: ${error.message}`);

  const detailedError = error as Error & {
    cause?: {
      servers?: Map<string, { error?: Error }>;
    };
  };

  const servers = detailedError.cause?.servers;

  if (servers instanceof Map && servers.size > 0) {
    for (const [address, description] of servers.entries()) {
      if (description.error) {
        logger(`Server ${address}: ${description.error.message}`);
      }
    }
  }
}


  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });


void startServer();