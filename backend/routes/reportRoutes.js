import express from "express";
import { generateCandidateReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/final/:candidateId", generateCandidateReport);

export default router;
