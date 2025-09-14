import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["candidate", "proctor", "admin"],
    required: true,
  },
  candidateId: {
    type: String,
    unique: true,
    sparse: true, 
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  online: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
