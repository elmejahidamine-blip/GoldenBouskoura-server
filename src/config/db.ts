import dns from "node:dns";
import mongoose from "mongoose";

async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  // Work around local DNS resolvers that fail Atlas SRV lookups in Node.
  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
}

export default connectToDatabase;
