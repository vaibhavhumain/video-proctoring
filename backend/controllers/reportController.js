import Log from "../models/Log.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit"; 
export const generateCandidateReport = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const user = await User.findOne({ candidateId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const logs = await Log.find({ candidateId }).sort({ timestamp: 1 });

    const focusLost = logs.filter((l) =>
      l.event.toLowerCase().includes("away")
    ).length;
    const suspicious = logs.filter((l) =>
      l.event.toLowerCase().includes("detected")
    ).length;
    const duration =
      logs.length > 0
        ? Math.floor(
            (logs[logs.length - 1].timestamp - logs[0].timestamp) / 1000
          )
        : 0;
    const integrityScore = Math.max(
      0,
      100 - (focusLost * 5 + suspicious * 10)
    );

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${candidateId}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("🎓 Proctoring Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Candidate Name: ${user.name}`);
    doc.text(`Candidate ID: ${candidateId}`);
    doc.text(`Interview Duration: ${duration} sec`);
    doc.text(`Focus Lost: ${focusLost} times`);
    doc.text(`Suspicious Events: ${suspicious}`);
    doc.text(`Final Integrity Score: ${integrityScore}/100`);

    doc.moveDown().text("📋 Event Logs:", { underline: true });
    logs.forEach((log) => {
      doc.text(
        `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.event}`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
