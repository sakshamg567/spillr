import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import privateWallRoutes from "./routes/wall.js";
import feedbackRoutes from "./routes/feedback.js";
import authRoutes from "./routes/auth.js";
import userSettings from "./routes/userSettings.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from 'cookie-parser';
import WallRoute from './routes/wallRoutes.js'
import compression from 'compression';
const app = express();
app.use(compression());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const allowedOrigins = [
  "https://spillr.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        console.log('CORS allowed for:', origin);
        callback(null, true);
      } else {
        console.warn('CORS blocked for:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, 
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
  })
);


app.options('*', cors());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.url.startsWith("/uploads/"),
});
app.use(globalLimiter);

app.use(express.json({ limit: "1mb" }));



const uploadsPath = path.join(__dirname, "uploads");

app.use("/uploads", (req, res, next) => {
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all in dev
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use("/uploads", express.static(uploadsPath, {
  maxAge: "1d",
  setHeaders: (res, filePath) => {
    res.setHeader("Cache-Control", "public, max-age=86400");
  }
}));


app.use("/api/auth", authRoutes);
app.use("/api/wall", privateWallRoutes);
app.use("/api/public/wall",WallRoute);
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