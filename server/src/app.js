import express from "express";
import cors from "cors";
import session from "express-session";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import wallRoutes from './routes/wall.js'
import feedbackRoutes from "./routes/feedback.js";
import authRoutes from "./routes/auth.js";
import passport from './config/passport.js';
import userSettings from './routes/userSettings.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(helmet());

const globalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || []
    : ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '1mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, 
    sameSite: 'strict'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Server is running ");
});

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use(globalLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/wall", wallRoutes);
app.use('/api/feedback',feedbackRoutes);
app.use("/api/settings", userSettings);

app.use('/*splat', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});


export default app;