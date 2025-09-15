import Log from "../models/Log.js";
import User from "../models/User.js";
export const createLog = async (req, res) => {
  try {
    const { candidateId, event } = req.body;
    if (!candidateId || !event) {
      return res.status(400).json({ error: "candidateId and event are required" });
    }

    const log = new Log({ candidateId, event });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLogsByCandidate = async (req, res) => {
  try {
    const logs = await Log.find({ candidateId: req.params.candidateId }).sort({ timestamp: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getViolationsReport = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await User.findOne({ candidateId: log.candidateId });
        return {
          id: log._id,
          event: log.event,
          candidateId: log.candidateId,
          userName: user ? user.name : "Unknown",
          timestamp: log.timestamp,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
