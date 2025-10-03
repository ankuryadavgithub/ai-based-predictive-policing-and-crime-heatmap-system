import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ArimaChart.css'; // <-- we'll add loader styling here

// Format numbers in k/M for chart readability
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num;
};

// Format change with arrow symbol
const formatChange = (value) => {
  if (value > 0) return `↑ ${formatNumber(value)}`;
  if (value < 0) return `↓ ${formatNumber(Math.abs(value))}`;
  return `– 0`;
};

const ArimaChart = ({ selectedState }) => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController(); // ✅ abort controller
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);

      try {
        const stateParam = selectedState === 'All' ? '' : selectedState;
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api'}/arima-forecast`,
          {
            params: { state: stateParam, steps: 5 },
            signal: controller.signal, // ✅ link abort controller
          }
        );

        let data = response.data;

        if (selectedState === 'All') {
          // Aggregate predicted crimes by Year across all states
          const aggregated = {};
          data.forEach(item => {
            if (!aggregated[item.Year]) aggregated[item.Year] = 0;
            aggregated[item.Year] += item.Predicted_Crimes;
          });
          data = Object.keys(aggregated).map(year => ({
            Year: Number(year),
            'Predicted Crimes': aggregated[year]
          })).sort((a, b) => a.Year - b.Year);
        } else {
          // Single state
          data = data.map(item => ({
            Year: item.Year,
            'Predicted Crimes': item.Predicted_Crimes
          }));
        }

        // Compute Yearly Change
        const withChange = data.map((item, idx, arr) => {
          if (idx === 0) return { ...item, 'Change': 0 };
          return { ...item, 'Change': item['Predicted Crimes'] - arr[idx - 1]['Predicted Crimes'] };
        });

        setForecastData(withChange);

      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request cancelled:", err.message);
        } else {
          console.error(err);
          setError("Failed to fetch ARIMA forecast.");
        }
        setForecastData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();

    return () => {
      controller.abort(); // ✅ cancel pending requests on unmount
    };
  }, [selectedState]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Fetching ARIMA forecast...</p>
      </div>
    );
  }
  if (error) return <p className="error-msg">{error}</p>;
  if (!forecastData.length) return <p>No ARIMA forecast available.</p>;

  return (
    <div className="arima-chart-container">
      <h3>ARIMA Crime Forecast {selectedState !== 'All' ? `- ${selectedState}` : '(All States)'}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={forecastData}
          margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Year" />
          <YAxis yAxisId="left" tickFormatter={formatNumber} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'Change') return formatChange(value);
              return formatNumber(value);
            }}
            labelFormatter={label => `Year: ${label}`}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Predicted Crimes"
            stroke="#ff7300"
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Change"
            stroke="#387908"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
        Orange line = Predicted Crimes, Green line = Year-to-Year Change (↑ Increase / ↓ Decrease)
      </p>
    </div>
  );
};

export default ArimaChart;
