import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
const app = express();
import session from "express-session";


app.use(cors()); // allow all origins for now

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: false
}));
import passport from './config/passport.js'
app.use(passport.initialize())
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/ping", (req, res) => {
  console.log("Ping route hit!");
  res.json({ message: "pong" });
});

app.use("/api/auth", authRoutes);

export default app;
