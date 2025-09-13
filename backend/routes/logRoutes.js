import express from "express";
import { createLog, getLogsByCandidate } from "../controllers/logController.js";

const router = express.Router();

router.post("/", createLog); 
router.get("/:candidateId", getLogsByCandidate); 

export default router;
