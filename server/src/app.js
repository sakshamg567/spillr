import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import wallRoutes from "./routes/wall.js";
import feedbackRoutes from "./routes/feedback.js";
import authRoutes from "./routes/auth.js";
import userSettings from "./routes/userSettings.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from 'cookie-parser';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
    frameguard: { action: "deny" },
    hsts: { maxAge: 31536000 },
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.url.startsWith("/uploads/"),
});
app.use(globalLimiter);


app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL?.split(",") || []
        : ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser()); 


const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath, {
  maxAge: "1d",
  setHeaders: (res, path) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", "inline");
  },
}));


app.use("/api/auth", authRoutes);
app.use("/api/wall", wallRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/settings", userSettings);

app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ message: "Route not found" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed" });
  }

  res.status(500).json({ message: "Internal server error" });
});

export default app;