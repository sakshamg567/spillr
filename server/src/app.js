import express from "express";
import cors from "cors";

const app = express();

app.use(cors()); // allow all origins for now
app.use(express.json());

// Test routes
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/ping", (req, res) => {
  console.log("Ping route hit!");
  res.json({ message: "pong" });
});


export default app;
