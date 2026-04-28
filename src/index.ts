import "dotenv/config";
import app from "./app";
import connectToDatabase from "./config/db";

const port = Number(process.env.PORT) || 3000;
const allowStartupWithoutMongo =
  process.env.ALLOW_START_WITHOUT_MONGODB === "true" ||
  process.env.ALLOW_START_WITHOUT_MONGODB === "1";

function logStartupError(error: unknown): void {
  if (!(error instanceof Error)) {
    console.error("Failed to start server", error);
    return;
  }

  console.error("Failed to start server");
  console.error(`Name: ${error.name}`);
  console.error(`Message: ${error.message}`);

  const detailedError = error as Error & {
    cause?: {
      servers?: Map<string, { error?: Error }>;
    };
  };

  const servers = detailedError.cause?.servers;

  if (servers instanceof Map && servers.size > 0) {
    for (const [address, description] of servers.entries()) {
      if (description.error) {
        console.error(`Server ${address}: ${description.error.message}`);
      }
    }
  }
}

async function startServer(): Promise<void> {
  try {
    await connectToDatabase();
    console.log("MongoDB connected");
  } catch (error) {
    logStartupError(error);

    if (!allowStartupWithoutMongo) {
      process.exit(1);
    }

    console.warn("Continuing without MongoDB because ALLOW_START_WITHOUT_MONGODB is enabled.");
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

void startServer();
