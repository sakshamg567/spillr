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

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.url.startsWith('/uploads/');
  }
});

app.use(globalLimiter);

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
     sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
  }
}));

console.log(" Registering routes...");

app.use("/api/auth", (req, res, next) => {
  console.log(" Auth route hit:", req.method, req.url);
  next();
}, authRoutes);

app.use("/api/wall", (req, res, next) => {
  console.log(" Wall route hit:", req.method, req.url);
  next();
}, wallRoutes);

app.use('/api/feedback', (req, res, next) => {
  console.log(" Feedback route hit:", req.method, req.url);
  next();
}, feedbackRoutes);

app.use("/api/settings", (req, res, next) => {
  console.log(" Settings route hit:", req.method, req.url);
  next();
}, userSettings);

app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ message: 'Route not found' });
  }
});



app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

export default app;