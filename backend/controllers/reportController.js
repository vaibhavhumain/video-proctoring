import Log from "../models/Log.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit"; 

export const generateCandidateReport = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Fetch user
    const user = await User.findOne({ candidateId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch logs
    const logs = await Log.find({ candidateId }).sort({ timestamp: 1 });

    // Metrics
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

    // PDF setup
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${candidateId}.pdf`
    );

    doc.pipe(res);

    // --- Header ---
    doc
      .fontSize(22)
      .fillColor("#2E86AB")
      .text("🎓 Proctoring Report", { align: "center" })
      .moveDown(0.5);
    doc
      .fontSize(12)
      .fillColor("gray")
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" })
      .moveDown(1);

    // --- Candidate Info ---
    doc
      .fontSize(16)
      .fillColor("#000")
      .text("Candidate Information", { underline: true })
      .moveDown(0.5);

    doc.fontSize(12).fillColor("#333");
    doc.text(`Name: ${user.name}`);
    doc.text(`Candidate ID: ${candidateId}`);
    doc.text(`Email: ${user.email || "N/A"}`);
    doc.text(`Interview Duration: ${duration} seconds`);
    doc.moveDown(1);

    // --- Summary Metrics ---
    doc
      .fontSize(16)
      .fillColor("#000")
      .text("Summary", { underline: true })
      .moveDown(0.5);

    doc.fontSize(12).fillColor("#333");
    doc.text(`🔴 Focus Lost: ${focusLost} times`);
    doc.text(`🟡 Suspicious Events: ${suspicious}`);
    doc.moveDown(0.5);

    // Integrity Score with highlight
    doc
      .fontSize(14)
      .fillColor(integrityScore >= 80 ? "green" : integrityScore >= 50 ? "orange" : "red")
      .text(`✅ Final Integrity Score: ${integrityScore}/100`)
      .moveDown(1);

    // --- Detailed Logs ---
    doc
      .fontSize(16)
      .fillColor("#000")
      .text("📋 Event Logs", { underline: true })
      .moveDown(0.5);

    if (logs.length === 0) {
      doc.fontSize(12).fillColor("gray").text("No events recorded.");
    } else {
      logs.forEach((log, i) => {
        doc
          .fontSize(11)
          .fillColor("#444")
          .text(
            `${i + 1}. [${new Date(log.timestamp).toLocaleTimeString()}] ${log.event}`
          );
      });
    }

    // --- Footer ---
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("This is a system-generated report. © Video Proctoring System", {
        align: "center",
      });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
