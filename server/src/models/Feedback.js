import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  isAnswered: { type: Boolean, default: false, index: true }, 
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
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);