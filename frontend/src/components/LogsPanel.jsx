import React, { useEffect, useState } from "react";
import axios from "axios";

const LogsPanel = ({ candidateId }) => {
  const [latestLog, setLatestLog] = useState(null);

  // 🔹 Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `https://video-proctoring.onrender.com/api/logs/${candidateId}`
      );
      if (res.data.length > 0) {
        const last = res.data[res.data.length - 1];
        setLatestLog({
          time: new Date(last.timestamp).toLocaleTimeString(),
          event: last.event,
        });
      }
    } catch (err) {
      console.error("❌ Error fetching logs:", err);
    }
  };

  // Auto refresh logs
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
    return () => clearInterval(interval);
  }, [candidateId]);

  // Helper to colorize logs
  const getLogClass = (event) => {
    if (event.includes("⚠️") || event.toLowerCase().includes("away"))
      return "bg-gradient-to-r from-red-500 to-red-700 text-white";
    if (event.toLowerCase().includes("detected"))
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black";
    return "bg-gradient-to-r from-green-500 to-green-700 text-white";
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          📋 Live Status
        </h2>
      </div>

      {/* Latest log only */}
      <div className="flex-1 p-6 flex items-center justify-center">
        {latestLog ? (
          <div
            className={`w-full rounded-xl shadow-lg text-center p-6 animate-fade-in ${getLogClass(
              latestLog.event
            )}`}
          >
            <p className="text-xl font-semibold tracking-wide">
              {latestLog.event}
            </p>
            <span className="text-sm opacity-80 block mt-3">
              ⏱ {latestLog.time}
            </span>
          </div>
        ) : (
          <div className="text-gray-400 italic">No events yet...</div>
        )}
      </div>
    </div>
  );
};

export default LogsPanel;
