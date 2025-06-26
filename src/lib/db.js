import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
let cachedConnection = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return { mongoose: cachedConnection };
  }

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    const connection = await mongoose.connect(uri);
    cachedConnection = connection;
    console.log("Connected to MongoDB successfully");
    return { mongoose: connection };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}