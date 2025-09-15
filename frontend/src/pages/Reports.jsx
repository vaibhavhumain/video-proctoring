import { useEffect, useState } from "react";
import API from "../api";

const Reports = () => {
  const [candidates, setCandidates] = useState([]);

  const fetchCandidates = async () => {
    try {
      const res = await API.get("/users");
      setCandidates(
        res.data.filter((u) => u.role && u.role.toLowerCase() === "candidate")
      );
    } catch (err) {
      console.error("❌ Error fetching candidates:", err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const downloadReport = (candidateId) => {
    window.open(
      `https://video-proctoring.onrender.com/api/reports/final/${candidateId}`,
      "_blank"
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      {/* Page Heading */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center">
        📊 Reports Dashboard
      </h1>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4">
          <h2 className="text-lg font-bold text-white">Candidate Reports</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="px-6 py-3 text-left">Candidate</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center px-6 py-6 text-gray-500 italic"
                  >
                    No candidates found
                  </td>
                </tr>
              ) : (
                candidates.map((c, idx) => (
                  <tr
                    key={c._id}
                    className={`transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-purple-50`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => downloadReport(c.candidateId)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition transform hover:scale-105"
                      >
                        Download Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
