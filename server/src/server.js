import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
  'SESSION_SECRET',
  'MONGO_URI',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1); 
  }
}

console.log('All required environment variables are set');

import app from "./app.js";
import { connectDB } from "./config/db.js";


const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Server failed:", err.message);
});