import express from "express";
import { createLog, getLogsByCandidate, getViolationsReport } from "../controllers/logController.js";

const router = express.Router();

router.post("/", createLog); 
router.get("/:candidateId", getLogsByCandidate); 
router.get("/violations", getViolationsReport);
export default router;
