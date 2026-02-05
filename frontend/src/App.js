import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./Components/Dashboard";
import HeatmapPage from "./Components/HeatmapPage";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ReportCrime from "./Components/ReportCrime";
import PoliceEvidenceViewer from "./Components/PoliceEvidenceViewer";
function App() {
  const token = localStorage.getItem("token");

  // ✅ DEFINE DARK MODE STATE HERE
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              token ? (
                <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
<Route path="/police-evidence" element={<PoliceEvidenceViewer />} />
          <Route
            path="/heatmap"
            element={
              token ? (
                <HeatmapPage darkMode={darkMode} setDarkMode={setDarkMode} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/report-crime"
            element={
              token ? (
                <ReportCrime darkMode={darkMode} setDarkMode={setDarkMode} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;