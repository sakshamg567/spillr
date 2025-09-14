import dotenv from "dotenv";
dotenv.config();
console.log("ENV TEST:", process.env.GOOGLE_CLIENT_ID);
import app from "./app.js";
import { connectDB } from "./config/db.js";



const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Server failed:", err.message);
});
