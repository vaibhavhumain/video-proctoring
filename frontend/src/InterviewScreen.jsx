import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import API, { processFrame, uploadVideo } from "./api";
import LogsPanel from "./components/LogsPanel";
import {toast} from "react-toastify";
const InterviewScreen = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [roomData, setRoomData] = useState({
    eventCode: "----",
    candidates: [],
    proctors: [],
  });

  const fetchRoomData = async () => {
    try {
      const res = await API.get("/users");
      const users = res.data;
      setRoomData({
        eventCode: "HDWB9S",
        candidates: users.filter((u) => u.role?.toLowerCase() === "candidate"),
        proctors: users.filter((u) => u.role?.toLowerCase() === "proctor"),
      });
    } catch (err) {
      console.error("❌ Error fetching room data:", err);
    }
  };

  useEffect(() => {
    fetchRoomData();
    const interval = setInterval(fetchRoomData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sendFrame = async () => {
      if (webcamRef.current && roomData.candidates.length > 0) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        try {
          await processFrame(roomData.candidates[0].candidateId, imageSrc);
        } catch (err) {
          console.error("❌ Error sending frame:", err);
        }
      }
    };
    const interval = setInterval(sendFrame, 1000);
    return () => clearInterval(interval);
  }, [roomData.candidates]);

  const startRecording = () => {
    setRecordedChunks([]);
    const stream = webcamRef.current.stream;
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) setRecordedChunks((prev) => [...prev, event.data]);
    };
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const downloadRecording = () => {
    if (!recordedChunks.length) return;
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview_${Date.now()}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uploadRecordingHandler = async () => {
  if (!recordedChunks.length) return toast.warn("⚠️ No recording available");

  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const formData = new FormData();
  formData.append("video", blob, `interview_${Date.now()}.webm`);

  try {
    const res = await uploadVideo(formData);
    toast.success("✅ Uploaded successfully!");
    console.log("Video URL:", res.data.url);
  } catch (err) {
    console.error("❌ Upload error:", err);
    toast.error("❌ Failed to upload video");
  }
};

  return (
    <div className="h-screen w-full flex bg-gray-100">
      <div className="w-80 bg-white border-r shadow-lg flex flex-col">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg">
          🎛 Proctor Tools
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold mb-2 text-gray-700">Logs</h3>
          {roomData.candidates.length > 0 ? (
            <LogsPanel candidateId={roomData.candidates[0].candidateId} />
          ) : (
            <p className="text-gray-400 text-sm italic">No candidates online</p>
          )}
        </div>

        {/* Recording Controls */}
        <div className="p-4 border-t space-y-2">
          <h3 className="font-semibold text-gray-700">Recording</h3>
          {!recording ? (
            <button
              onClick={startRecording}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ▶ Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ⏹ Stop Recording
            </button>
          )}

          {recordedChunks.length > 0 && (
            <>
              <button
                onClick={downloadRecording}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                💾 Download
              </button>
              <button
                onClick={uploadRecordingHandler}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                ⬆ Upload
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <p className="text-gray-500">Event Code</p>
            <h2 className="text-2xl font-bold text-purple-600">{roomData.eventCode}</h2>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <p className="text-gray-500">Candidates</p>
            <h2 className="text-2xl font-bold text-green-600">{roomData.candidates.length}</h2>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <p className="text-gray-500">Proctors</p>
            <h2 className="text-2xl font-bold text-blue-600">{roomData.proctors.length}</h2>
          </div>
        </div>

        {/* Candidate Feeds */}
        <div className="flex-1 grid grid-cols-3 gap-4 p-4">
          {roomData.candidates.map((c, idx) => (
            <div
              key={c._id}
              className="bg-white rounded-lg shadow flex flex-col overflow-hidden"
            >
              {idx === 0 ? (
                <Webcam
                  ref={webcamRef}
                  audio={true}
                  screenshotFormat="image/jpeg"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                  Candidate {c.candidateId} Feed
                </div>
              )}

              <div className="px-3 py-2 bg-gray-50 border-t text-sm flex justify-between items-center">
                <span className="font-medium">{c.name}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    c.online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;
  