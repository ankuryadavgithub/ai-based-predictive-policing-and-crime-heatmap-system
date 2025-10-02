import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Components/Navbar';
import FilterPanel from './Components/FilterPanel';
import MapComponent from './Components/MapComponent';
import Charts from './Components/Charts';
import ArimaChart from './Components/ArimaChart';

import './App.css';

// Optional: future panels
// import SummaryPanel from './Components/SummaryPanel';
// import TablePanel from './Components/TablePanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

function App() {
  const [selectedDataset, setSelectedDataset] = useState('historical');
  const [darkMode, setDarkMode] = useState(false);

  // Data state
  const [rawMapData, setRawMapData] = useState([]);
  const [groupedMapData, setGroupedMapData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [states, setStates] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState(['All']);
  const [selectedYear, setSelectedYear] = useState('All');
  const [forecastSteps, setForecastSteps] = useState(3); // default 3 years


  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- Helpers ----------------
  const groupDataByCrimeType = (data) => {
    const grouped = {};
    data.forEach(item => {
      const type = item['Crime Type'] || 'Unknown';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item);
    });
    return { grouped, allCrimeTypes: Object.keys(grouped).sort() };
  };

  // ---------------- Fetch Filter Options ----------------
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
        console.error(err);
        setError("Failed to load filter options.");
      }
    };
    fetchFilterOptions();
  }, []);

  // ---------------- Fetch Map & Chart Data ----------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let fetchedMapData = [];
        let fetchedChartData = [];
        const crimeParam = selectedCrimeTypes.includes('All') ? 'All' : selectedCrimeTypes.join(',');

        if (selectedDataset === 'combined') {
          const [historicalRes, predictedRes] = await Promise.all([
            axios.get(`${API_URL}/historical`, { params: { state: selectedState, crime_type: crimeParam, year: selectedYear } }),
            axios.get(`${API_URL}/predicted`, { params: { state: selectedState, crime_type: crimeParam, year: selectedYear } })
          ]);

          fetchedMapData = [...historicalRes.data.mapData, ...predictedRes.data.mapData];

          const historicalChartMap = new Map(historicalRes.data.chartData.map(item => [item.Year, item['Crime Count']]));
          const predictedChartMap = new Map(predictedRes.data.chartData.map(item => [item.Year, item['Crime Count']]));
          const allYears = [...new Set([...historicalChartMap.keys(), ...predictedChartMap.keys()])].sort();

          fetchedChartData = allYears.map(year => ({
            Year: year,
            'Crime Count': (historicalChartMap.get(year) || 0) + (predictedChartMap.get(year) || 0)
          }));

        } else {
          const endpoint = selectedDataset === 'historical' ? `${API_URL}/historical` : `${API_URL}/predicted`;
          const response = await axios.get(endpoint, {
            params: { state: selectedState, crime_type: crimeParam, year: selectedYear }
          });
          fetchedMapData = response.data.mapData || [];
          fetchedChartData = response.data.chartData || [];
        }

        // Frontend filter for multiple crime types
        if (!selectedCrimeTypes.includes('All')) {
          fetchedMapData = fetchedMapData.filter(d => selectedCrimeTypes.includes(d['Crime Type']));
        }

        setRawMapData(fetchedMapData);
        setChartData(fetchedChartData);
        const { grouped } = groupDataByCrimeType(fetchedMapData);
        setGroupedMapData(grouped);

      } catch (err) {
        console.error(err);
        setError("Failed to load crime data. Please try again.");
        setRawMapData([]);
        setGroupedMapData({});
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDataset, selectedState, selectedCrimeTypes, selectedYear]);

  // ---------------- Render ----------------
  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>

      {/* Navbar */}
      <Navbar selectedDataset={selectedDataset} setSelectedDataset={setSelectedDataset} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content */}
      <div className="main-content">

        {/* Map Section */}
        <div className="map-section">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading Map & Chart Data...</p>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          <MapComponent groupedMapData={groupedMapData} />
        </div>

        {/* Bottom Panel: Filter + Charts + Future Panels */}
        <div className="bottom-panel">

          {/* Filter Panel */}
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

          {/* Charts Panel */}
          <div className="chart-section">
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading Chart Data...</p>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <Charts
              chartData={chartData}
              selectedCrimeTypes={selectedCrimeTypes.includes('All') ? Object.keys(groupedMapData) : selectedCrimeTypes}

              
            />
                        {/* ARIMA Forecast Panel */}
            <div className="arima-chart-section" style={{ marginTop: '30px' }}>
              <ArimaChart selectedState={selectedState} steps={forecastSteps} />
            </div>
          </div>


          {/* Future Panel Example */}
          {/* <div className="summary-section">
              <SummaryPanel data={summaryData} />
          </div> */}

        </div>
      </div>
    </div>
  );
}

export default App;
