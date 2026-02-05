import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./ReportCrime.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

export default function ReportCrime() {
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    crime_type: "",
    description: "",
    severity: "Medium"
  });

  // 📍 Auto fetch location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      err => alert("Location access denied")
    );
  }, []);

  // Add files (append, not replace)
  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Remove specific evidence
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };


 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!location.lat || !location.lng) {
    alert("📍 Location not available. Please allow location access.");
    return;
  }

  if (!form.crime_type || !form.description) {
    alert("Please fill all required fields");
    return;
  }

  const data = new FormData();
  data.append("crime_type", form.crime_type);
  data.append("description", form.description);
  data.append("severity", form.severity);
  data.append("latitude", location.lat);
  data.append("longitude", location.lng);
  data.append("username", localStorage.getItem("username"));

  for (let f of files) {
    data.append("files", f);
  }

  try {
    await axios.post(`${API_URL}/report-crime`, data);
    alert("✅ Crime reported successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to submit report");
  }
};

  return (
    <>
      <Navbar />
      <div className="report-container">
        <div className="police-badge-bg" />
        <h2>Report a Crime</h2>

        <form onSubmit={handleSubmit}>
          <label>Crime Type</label>
          <input required onChange={e => setForm({ ...form, crime_type: e.target.value })} />

          <label>Description</label>
          <textarea required onChange={e => setForm({ ...form, description: e.target.value })} />

          <label>Severity</label>
          <select onChange={e => setForm({ ...form, severity: e.target.value })}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Upload Evidence (Images / Videos)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileAdd}
          />
          {files.length > 0 && (
          <div className="evidence-list">
            {files.map((file, index) => (
              <div className="evidence-item" key={index}>
                <span>{file.name}</span>
                <button type="button" onClick={() => removeFile(index)}>✖</button>
              </div>
            ))}
          </div>
        )}

          <p>📍 Location: {location.lat}, {location.lng}</p>

          <button type="submit">Submit Report</button>
        </form>
      </div>
    </>
  );
}