// server/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: function () {
        return !this.googleId; 
      },
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId; 
      },
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
