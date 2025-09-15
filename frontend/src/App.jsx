import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import InterviewScreen from "./InterviewScreen";
import Reports from "./pages/Reports";
import VideoDashboard from "./components/VideoDashboard";
import "react-toastify/dist/ReactToastify.css";
import {ToastContainer} from "react-toastify";
function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000}/>
      <Routes>
        <Route path="/" element={<InterviewScreen />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/videos" element={<VideoDashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
