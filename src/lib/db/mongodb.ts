// lib/db/mongodb.ts
import mongoose from "mongoose";

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Global cache for MongoDB connection
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise && MONGODB_URI) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Connected to MongoDB");
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", e);
    throw e;
  }

  const connection = cached.conn;
  if (connection === null) {
    throw new Error("Database connection not established");
  }
  return connection;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    return conn.readyState === 1; // 1 = connected
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

export default connectToDatabase;
