import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import logRoutes from "./routes/logRoutes.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(morgan("dev"));
app.use("/api/logs", logRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => res.send("API is running..."));

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
