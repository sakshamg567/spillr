import dotenv from "dotenv";
dotenv.config();


import app from "./app.js";
import { connectDB } from "./config/db.js";

console.log("ENV TEST:", process.env.GOOGLE_CLIENT_ID);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Server failed:", err.message);
});