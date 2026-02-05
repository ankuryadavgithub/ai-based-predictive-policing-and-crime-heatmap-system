import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import FilterPanel from "./FilterPanel";
import MapComponent from "./MapComponent";
import Charts from "./Charts";
import ArimaChart from "./ArimaChart";

import "../App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

function Dashboard({ darkMode, setDarkMode }) {
  const [selectedDataset, setSelectedDataset] = useState("historical");

  // const [rawMapData, setRawMapData] = useState([]);
  const [groupedMapData, setGroupedMapData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [states, setStates] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [forecastSteps, setForecastSteps] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);


  // Grouping helper
  // const groupDataByCrimeType = (data) => {
  //   const grouped = {};
  //   data.forEach((item) => {
  //     const type = item["Crime Type"] || "Unknown";
  //     if (!grouped[type]) grouped[type] = [];
  //     grouped[type].push(item);
  //   });
  //   return { grouped, allCrimeTypes: Object.keys(grouped).sort() };
  // };

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [statesRes, crimeTypesRes, yearsRes] = await Promise.all([
          axios.get(`${API_URL}/states`),
          axios.get(`${API_URL}/crime_types`),
          axios.get(`${API_URL}/years`),
        ]);
        setStates(statesRes.data);
        setCrimeTypes(crimeTypesRes.data);
        setYears(yearsRes.data);
      } catch (err) {
        setError("Failed to load filter options.");
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch crime/map data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const crimeParam =
          selectedCrimeTypes.length === 0
            ? "All"
            : selectedCrimeTypes.join(",");

        const endpoint =
          selectedDataset === "combined"
            ? "historical"
            : selectedDataset;

        const response = await axios.get(`${API_URL}/${endpoint}`, {
          params: {
            state: selectedState,
            crime_type: crimeParam,
            year: selectedYear,
          },
        });

        const grouped = {};
        response.data.mapData.forEach((item) => {
          const type = item["Crime Type"] || "Unknown";
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push(item);
        });

        setGroupedMapData(grouped);
        setChartData(response.data.chartData || []);
      } catch {
        setError("Failed to load crime data.");
        setGroupedMapData({});
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDataset, selectedState, selectedCrimeTypes, selectedYear]);


  return (
    <div className={`dashboard-container ${darkMode ? "dark-mode" : ""}`}>
      <Navbar
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="main-content">
        <div className="map-section">
          {loading && <p>Loading Map & Chart Data...</p>}
          {error && <div className="error-message">{error}</div>}
          <MapComponent groupedMapData={groupedMapData} selectedState={selectedState}
            selectedCrimeTypes={selectedCrimeTypes} onMapReady= {() => setMapReady(True)} />
        </div>

        <div className="bottom-panel">
          <div className="filter-section">
            <FilterPanel
              states={states}
              crimeTypes={crimeTypes}
              years={years}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedCrimeTypes={selectedCrimeTypes}
              setSelectedCrimeTypes={setSelectedCrimeTypes}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          </div>
    
          <div className="chart-section">
            <Charts
              chartData={chartData}
              selectedCrimeTypes={
                selectedCrimeTypes.length ===0
                  ? Object.keys(groupedMapData)
                  : selectedCrimeTypes
              }
            />
            <div className="arima-chart-section" style={{ marginTop: "30px" }}>
              <ArimaChart selectedState={selectedState} steps={forecastSteps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
