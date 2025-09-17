import express from "express";
import cors from "cors";
import session from "express-session";
import wallRoutes from './routes/wall.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false
}));

import passport from './config/passport.js';
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/ping", (req, res) => {
  console.log("Ping route hit!");
  res.json({ message: "pong" });
});


import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);
app.use("/api/wall", wallRoutes);
export default app;