import React, { useState, useEffect } from "react";
import axios from "axios";
import MapComponent from "./MapComponent";
import FilterPanel from "./FilterPanel";
import Navbar from "./Navbar";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

const HeatmapPage = ({ darkMode, setDarkMode }) => {
  const [groupedMapData, setGroupedMapData] = useState({});
  const [selectedDataset, setSelectedDataset] = useState("historical");

  const [selectedState, setSelectedState] = useState("All");
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");


  useEffect(() => {
    const fetchMapData = async () => {
      const endpoint =
        selectedDataset === "predicted" ? "predicted" : "historical";

      const crimeParam =
        selectedCrimeTypes.length === 0 || selectedCrimeTypes.includes("All")
          ? "All"
          : selectedCrimeTypes.join(",");

      const res = await axios.get(`${API_URL}/${endpoint}`, {
        params: {
          state: selectedState,
          crime_type: crimeParam,
          year: selectedYear
        }
      });

      const grouped = {};
      res.data.mapData.forEach(row => {
        const ct = row["Crime Type"];
        if (!grouped[ct]) grouped[ct] = [];
        grouped[ct].push(row);
      });

      setGroupedMapData(grouped);
    };

    fetchMapData();
  }, [selectedDataset, selectedState, selectedCrimeTypes, selectedYear]);

  return (
    <>
      <Navbar
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <FilterPanel
        states={["All"]}
        crimeTypes={Object.keys(groupedMapData)}
        years={["All"]}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedCrimeTypes={selectedCrimeTypes}
        setSelectedCrimeTypes={setSelectedCrimeTypes}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
      <div style={{ height: "75vh" }}>
        <MapComponent
          groupedMapData={groupedMapData}
          selectedCrimeTypes={selectedCrimeTypes}
          selectedState={selectedState}
          selectedDataset={selectedDataset}
        />
      </div>
    </>
  );
};

export default HeatmapPage;
