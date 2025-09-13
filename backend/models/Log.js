import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: true,
  },
  event: {
    type: String,
    required: true, 
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Log", logSchema);
