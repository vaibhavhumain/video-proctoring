import { useEffect, useState } from "react";
import API from "../api";

const VideoDashboard = () => {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const res = await API.get("/videos");
      setVideos(res.data);
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center space-x-2">
        <span>🎥</span>
        <span>Recorded Videos</span>
      </h1>

      {videos.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg shadow-inner">
          <p className="text-gray-500 italic">No videos uploaded yet...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((v, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-5 flex flex-col"
            >
              <video
                controls
                className="w-full h-52 object-cover rounded-md mb-4 border"
              >
                <source src={v.url} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            
              <div className="flex flex-col flex-1">
                <p className="text-base font-semibold text-gray-800 truncate">
                  {v.name || `Video ${idx + 1}`}
                </p>
              </div>

              <a
                href={v.url}
                download
                className="mt-4 inline-block text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition"
              >
                ⬇️ Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoDashboard;
