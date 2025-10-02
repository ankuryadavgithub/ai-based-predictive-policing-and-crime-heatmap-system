import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// Helper to format numbers nicely (1,200 -> "1.2k", 1000000 -> "1M")
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num;
};

function Charts({ chartData }) {
  return (
    <div className="charts-container">
      <h3>Crime Trends Over Time</h3>
      {chartData && chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Line type="monotone" dataKey="Crime Count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>

          <h3 style={{ marginTop: '30px' }}>Crime Count by Year (Bar Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Year" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="Crime Count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p>No chart data available for the selected filters.</p>
      )}
    </div>
  );
}

export default Charts;
