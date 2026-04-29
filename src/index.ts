import "dotenv/config";
import app from "./app";
import connectToDatabase from "./config/db";

const port = Number(process.env.PORT) || 3000;
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

async function startServer(): Promise<void> {
  try {
    await connectToDatabase();
    console.log("MongoDB connected");
  } catch (error) {
    if (!allowStartupWithoutMongo) {
      logMongoConnectionError(error);
      process.exit(1);
    }

    logMongoConnectionError(error, "warn");
    console.warn("Continuing without MongoDB because ALLOW_START_WITHOUT_MONGODB is enabled.");
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

void startServer();
