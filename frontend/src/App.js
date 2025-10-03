// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Components/Dashboard";
import HeatmapPage from "./Components/HeatmapPage";
import Login from "./Components/Login";
import Register from "./Components/Register";

function App() {
  const token = localStorage.getItem("token"); // check login status

  return (
    <Router>
      <Routes>
        {/* Default route -> Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/heatmap"
          element={token ? <HeatmapPage /> : <Navigate to="/login" />}
        />

        {/* Fallback */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
