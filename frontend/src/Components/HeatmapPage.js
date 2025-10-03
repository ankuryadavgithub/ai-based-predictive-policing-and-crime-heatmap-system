import React, { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import Navbar from "./Navbar";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

const HeatmapPage = () => {
  const [groupedMapData, setGroupedMapData] = useState({});
  const [selectedDataset, setSelectedDataset] = useState("historical");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = "";
        if (selectedDataset === "historical") endpoint = "historical";
        else if (selectedDataset === "predicted") endpoint = "predicted";
        else if (selectedDataset === "combined") endpoint = "historical"; // fallback

        const res = await axios.get(`${API_URL}/${endpoint}`);
        const data = res.data.mapData || [];

        const grouped = {};
        data.forEach((item) => {
          const type = item["Crime Type"] || "Unknown";
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push(item);
        });
        setGroupedMapData(grouped);
      } catch (err) {
        console.error("Failed to load map data:", err);
        setError("Failed to load map data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [selectedDataset]);

  return (
    <div className={`heatmap-page ${darkMode ? "dark-mode" : ""}`} style={{ height: "100vh", width: "100%" }}>
      <Navbar
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div style={{ height: "calc(100vh - 60px)", width: "100%", position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", zIndex: 10 }}>
            <p>Loading Map Data...</p>
          </div>
        )}
        {error && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px", background: "red", color: "white", zIndex: 10 }}>
            {error}
          </div>
        )}
        <MapComponent groupedMapData={groupedMapData} />
      </div>
    </div>
  );
};

export default HeatmapPage;
