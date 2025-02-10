// src/database/config.ts
import dotenv from "dotenv"

dotenv.config()

export const dbConfig = {
  uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.env.DB_NAME || "music_app",
  options: {
    // MongoDB connection options
    useUnifiedTopology: true,
    maxPoolSize: 10,
  },
}
