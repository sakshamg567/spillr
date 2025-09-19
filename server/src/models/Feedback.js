import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  wallId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Wall", 
    required: true, 
    index: true 
  },
  reactions: {
    type: Map,
    of: Number,
    default: {}
  },
  isAnswered: { type: Boolean, default: false, index: true },
  isArchived: { type: Boolean, default: false, index: true }, 
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);