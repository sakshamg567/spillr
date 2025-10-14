import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log(" MONGO_URI not set, skipping DB connection");
      return;
    }

   await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10, 
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
    });
    console.log(" MongoDB Connected with connection pooling");
  } catch (err) {
    console.error(" MongoDB Connection Error:", err);
    process.exit(1);
  }
};
