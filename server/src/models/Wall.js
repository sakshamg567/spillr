import mongoose from 'mongoose';

const wallSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
        username: { 
      type: String,
      required: true,
      index: true, 
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      immutable:true,
    },
    customColors: {
      primary: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
          },
          message: "Invalid color format",
        },
      },
      background: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
          },
          message: "Invalid color format",
        },
      },
      accent: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
          },
          message: "Invalid color format",
        },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Wall", wallSchema);
