import Log from "../models/Log.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

// Helper: Format duration into hh:mm:ss
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? `${h}h` : null,
    m > 0 ? `${m}m` : null,
    `${s}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCandidateReport = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Fetch user
    const user = await User.findOne({ candidateId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch logs
    const logs = await Log.find({ candidateId }).sort({ timestamp: 1 });

    // --- Metrics ---
    // Focus lost events
    const focusLost = logs.filter((l) => {
      const e = l.event.toLowerCase();
      return e.includes("away") || e.includes("focus lost");
    }).length;

    // Suspicious events (robust keyword matching)
    const suspiciousEvents = logs.filter((l) => {
      const e = l.event.toLowerCase();
      return (
        e.includes("detected") ||
        e.includes("phone") ||
        e.includes("book") ||
        e.includes("notes") ||
        e.includes("multiple face") ||
        e.includes("no face")
      );
    });

    // Group suspicious logs by unique message to avoid over-penalizing repeats
    const uniqueSuspiciousTypes = [
      ...new Set(suspiciousEvents.map((l) => l.event.toLowerCase())),
    ];

    // Duration
    const duration =
      logs.length > 0
        ? Math.floor(
            (logs[logs.length - 1].timestamp - logs[0].timestamp) / 1000
          )
        : 0;

    // --- Deduction Logic ---
    const focusDeduction = focusLost * 5;
    const suspiciousDeduction = uniqueSuspiciousTypes.length * 10;

    const totalDeductions = focusDeduction + suspiciousDeduction;

    let integrityScore = 100 - totalDeductions;
    if (integrityScore < 0) integrityScore = 0;

    // --- PDF setup ---
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${candidateId}.pdf`
    );
    doc.pipe(res);

    // --- Header ---
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#2E86AB")
      .text("Proctoring Report", { align: "center" })
      .moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("gray")
      .text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" }
      )
      .moveDown(1);

    // --- Candidate Info ---
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#000")
      .text("Candidate Information", { underline: true })
      .moveDown(0.5);

    doc.font("Helvetica").fontSize(12).fillColor("#333");
    doc.text(`Name: ${user.name}`);
    doc.text(`Candidate ID: ${candidateId}`);
    doc.text(`Email: ${user.email || "N/A"}`);
    doc.text(`Interview Duration: ${formatDuration(duration)}`);
    doc.moveDown(1);

    // --- Summary ---
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#000")
      .text("Summary", { underline: true })
      .moveDown(0.5);

    doc.font("Helvetica").fontSize(12);

    doc
      .fillColor("red")
      .text(`Focus Lost: ${focusLost} times (-${focusDeduction})`);
    doc
      .fillColor("orange")
      .text(
        `Suspicious Types: ${uniqueSuspiciousTypes.length} (-${suspiciousDeduction})`
      );
    doc.moveDown(0.5);

    const scoreColor =
      integrityScore >= 80 ? "green" : integrityScore >= 50 ? "orange" : "red";

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(scoreColor)
      .text(`Final Integrity Score: ${integrityScore}/100`)
      .moveDown(1);

    // --- Event Logs ---
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#000")
      .text("Event Logs", { underline: true })
      .moveDown(0.5);

    if (logs.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("gray")
        .text("No events recorded.");
    } else {
      logs.forEach((log, i) => {
        doc
          .font("Helvetica")
          .fontSize(11)
          .fillColor("#444")
          .text(
            `${i + 1}. [${new Date(log.timestamp).toLocaleTimeString()}] ${
              log.event
            }`
          );
      });
    }

    // --- Footer ---
    doc.moveDown(2);
    doc
      .font("Helvetica-Oblique")
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
