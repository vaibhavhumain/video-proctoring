import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const InterviewScreen = () => {
  const webcamRef = useRef(null);
  const [logs, setLogs] = useState([]);

  // Function to add log
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Example test log
  const handleTestLog = () => {
    addLog("Candidate joined the interview ✅");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Video Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-blue-500">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-[640px] h-[480px] object-cover"
          />
        </div>
      </div>

      {/* Logs Section */}
      <div className="w-96 bg-white shadow-lg border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">📋 Live Logs</h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-gray-500">No events yet...</p>
          ) : (
            logs.map((log, i) => (
              <p key={i} className="text-sm font-mono text-gray-800">
                {log}
              </p>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={handleTestLog}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Add Test Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
