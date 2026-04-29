import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../src/app";
import connectToDatabase from "../src/config/db";

let mongoConnection: Promise<void> | null = null;

function ensureDatabaseConnection(): Promise<void> {
  mongoConnection ??= connectToDatabase();
  return mongoConnection;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url !== "/" && req.url !== "/health") {
    await ensureDatabaseConnection();
  }

  return app(req, res);
}
