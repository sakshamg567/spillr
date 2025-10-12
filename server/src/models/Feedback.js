import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, trim: true },
  wallId: { type: mongoose.Schema.Types.ObjectId, ref: "Wall", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true }, 
  ipAddress: { type: String, default: null, index: true }, 
  reactions: {
    type: Map,
    of: Number,
    default: {}
  },
  isAnswered: { type: Boolean, default: false, index: true },
  isArchived: { type: Boolean, default: false, index: true },
}, {
  timestamps: true
});

feedbackSchema.index({ wallId: 1, isAnswered: 1, isArchived: 1 });
feedbackSchema.index({ userId: 1, wallId: 1 });
feedbackSchema.index({ ipAddress: 1, wallId: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
