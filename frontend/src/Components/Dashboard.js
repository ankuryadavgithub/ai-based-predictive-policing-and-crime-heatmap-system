import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import FilterPanel from "./FilterPanel";
import MapComponent from "./MapComponent";
import Charts from "./Charts";
import ArimaChart from "./ArimaChart";

import "../App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

function Dashboard() {
  const [selectedDataset, setSelectedDataset] = useState("historical");
  const [darkMode, setDarkMode] = useState(false);

  const [rawMapData, setRawMapData] = useState([]);
  const [groupedMapData, setGroupedMapData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [states, setStates] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState(["All"]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [forecastSteps, setForecastSteps] = useState(3);

  // Loading & Error States
  const [loadingMap, setLoadingMap] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [errorMap, setErrorMap] = useState(null);
  const [errorCharts, setErrorCharts] = useState(null);

  // -------------------- Helpers --------------------
  const groupDataByCrimeType = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const type = item["Crime Type"] || "Unknown";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item);
    });
    return { grouped, allCrimeTypes: Object.keys(grouped).sort() };
  };

  // -------------------- Fetch Filter Options --------------------
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
      } catch {
        setErrorMap("Failed to load filter options.");
      }
    };
    fetchFilterOptions();
  }, []);

  // -------------------- Fetch Crime Data --------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoadingMap(true);
      setLoadingCharts(true);
      setErrorMap(null);
      setErrorCharts(null);

      try {
        let fetchedMapData = [];
        let fetchedChartData = [];
        const crimeParam = selectedCrimeTypes.includes("All")
          ? "All"
          : selectedCrimeTypes.join(",");

        if (selectedDataset === "combined") {
          const [historicalRes, predictedRes] = await Promise.all([
            axios.get(`${API_URL}/historical`, {
              params: { state: selectedState, crime_type: crimeParam, year: selectedYear },
            }),
            axios.get(`${API_URL}/predicted`, {
              params: { state: selectedState, crime_type: crimeParam, year: selectedYear },
            }),
          ]);

          fetchedMapData = [
            ...historicalRes.data.mapData,
            ...predictedRes.data.mapData,
          ];

          const historicalChartMap = new Map(
            historicalRes.data.chartData.map((item) => [item.Year, item["Crime Count"]])
          );
          const predictedChartMap = new Map(
            predictedRes.data.chartData.map((item) => [item.Year, item["Crime Count"]])
          );
          const allYears = [...new Set([...historicalChartMap.keys(), ...predictedChartMap.keys()])].sort();

          fetchedChartData = allYears.map((year) => ({
            Year: year,
            "Crime Count": (historicalChartMap.get(year) || 0) + (predictedChartMap.get(year) || 0),
          }));
        } else {
          const endpoint =
            selectedDataset === "historical"
              ? `${API_URL}/historical`
              : `${API_URL}/predicted`;

          const response = await axios.get(endpoint, {
            params: { state: selectedState, crime_type: crimeParam, year: selectedYear },
          });

          fetchedMapData = response.data.mapData || [];
          fetchedChartData = response.data.chartData || [];
        }

        if (!selectedCrimeTypes.includes("All")) {
          fetchedMapData = fetchedMapData.filter((d) =>
            selectedCrimeTypes.includes(d["Crime Type"])
          );
        }

        setRawMapData(fetchedMapData);
        setChartData(fetchedChartData);
        const { grouped } = groupDataByCrimeType(fetchedMapData);
        setGroupedMapData(grouped);

      } catch (err) {
        console.error(err);
        setErrorMap("Failed to load crime data.");
        setErrorCharts("Failed to load chart data.");
        setRawMapData([]);
        setGroupedMapData({});
        setChartData([]);
      } finally {
        setLoadingMap(false);
        setLoadingCharts(false);
      }
    };

    fetchData();
  }, [selectedDataset, selectedState, selectedCrimeTypes, selectedYear]);

  // -------------------- Memoized Components --------------------
  const MemoizedMap = useMemo(() => <MapComponent groupedMapData={groupedMapData} />, [groupedMapData]);
  const MemoizedCharts = useMemo(() => (
    <Charts
      chartData={chartData}
      selectedCrimeTypes={
        selectedCrimeTypes.includes("All")
          ? Object.keys(groupedMapData)
          : selectedCrimeTypes
      }
    />
  ), [chartData, groupedMapData, selectedCrimeTypes]);

  // -------------------- Render --------------------
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
          {loadingMap && <p>Loading Map Data...</p>}
          {errorMap && <div className="error-message">{errorMap}</div>}
          {!loadingMap && !errorMap && MemoizedMap}
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
            {loadingCharts && <p>Loading Charts...</p>}
            {errorCharts && <div className="error-message">{errorCharts}</div>}
            {!loadingCharts && !errorCharts && MemoizedCharts}

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
