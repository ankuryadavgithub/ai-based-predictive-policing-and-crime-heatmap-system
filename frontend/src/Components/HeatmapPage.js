import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import MapComponent from "./MapComponent";
import Navbar from "./Navbar";
import FilterPanel from "./FilterPanel";

// ✅ local GeoJSON (as you mentioned)
import indiaStateGeoJson from "./india_state_geo.json";

const API_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

const HeatmapPage = () => {
  /* ---------------- STATE ---------------- */
  const [groupedMapData, setGroupedMapData] = useState({});
  const [selectedDataset, setSelectedDataset] = useState("historical");

  const [selectedState, setSelectedState] = useState("All");
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState([]);
  const [selectedCrimeType, setSelectedCrimeType] = useState("ALL");

  const [selectedYear, setSelectedYear] = useState("All");

  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- SYNC MULTI-SELECT → SINGLE CRIME ---------------- */
  useEffect(() => {
    if (selectedCrimeTypes.length === 1) {
      setSelectedCrimeType(selectedCrimeTypes[0]);
    } else {
      setSelectedCrimeType("ALL");
    }
  }, [selectedCrimeTypes]);

  /* ---------------- FETCH MAP DATA ---------------- */
  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      setError(null);

      try {
        let endpoint = "historical";
        if (selectedDataset === "predicted") endpoint = "predicted";

        const res = await axios.get(`${API_URL}/${endpoint}`);
        const data = res.data?.mapData || [];

        // 🔑 group by crime type
        const grouped = {};
        data.forEach(row => {
          const crimeType = row["Crime Type"] || "Unknown";
          if (!grouped[crimeType]) grouped[crimeType] = [];
          grouped[crimeType].push(row);
        });

        setGroupedMapData(grouped);
      } catch (err) {
        console.error(err);
        setError("Failed to load map data");
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [selectedDataset]);

  /* ---------------- DERIVED FILTER DATA ---------------- */
  const states = useMemo(() => {
    const set = new Set(["All"]);
    Object.values(groupedMapData)
      .flat()
      .forEach(d => {
        if (d.state) set.add(d.state);
      });
    return Array.from(set);
  }, [groupedMapData]);

  const crimeTypes = useMemo(
    () => Object.keys(groupedMapData),
    [groupedMapData]
  );

  /* ---------------- RENDER ---------------- */
  return (
    <div
      className={`heatmap-page ${darkMode ? "dark-mode" : ""}`}
      style={{ height: "100vh", width: "100%" }}
    >
      {/* -------- NAVBAR -------- */}
      <Navbar
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* -------- FILTER PANEL -------- */}
      <FilterPanel
        states={states}
        crimeTypes={crimeTypes}
        years={["All"]}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedCrimeTypes={selectedCrimeTypes}
        setSelectedCrimeTypes={setSelectedCrimeTypes}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      {/* -------- MAP AREA -------- */}
      <div
        style={{
          height: "calc(100vh - 120px)",
          width: "100%",
          position: "relative"
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.7)",
              zIndex: 10
            }}
          >
            <p>Loading map data…</p>
          </div>
        )}

        {error && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "10px",
              background: "red",
              color: "white",
              zIndex: 10
            }}
          >
            {error}
          </div>
        )}

        {/* -------- DECK.GL MAP -------- */}
        <MapComponent
          groupedMapData={groupedMapData}
          selectedCrimeType={selectedCrimeType}
          selectedState={selectedState}
          indiaStateGeoJson={indiaStateGeoJson}
        />
      </div>
    </div>
  );
};

export default HeatmapPage;
