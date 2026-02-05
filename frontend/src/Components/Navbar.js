import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ selectedDataset, setSelectedDataset, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  // Read role once on mount
  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/login');
  }, [navigate]);

  const toggleDarkMode = useCallback(() => {
    if (typeof setDarkMode === "function") {
      setDarkMode(prev => !prev);
    }
  }, [setDarkMode]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">AI Crime Dashboard</h1>
      </div>

      <div className="navbar-right">
        {role === "user" && (
        <button 
          className="dataset-btn report-crime-btn"
          onClick={() => navigate("/report-crime")}
        >
          🚨 Report Crime
        </button>
      )}
      {role === "police" && (
        <button
          className="verify-btn"
          onClick={() => navigate("/police-evidence")}
        >
          🛡 Evidence Verification
        </button>
      )}      
        {/* Dataset toggle – only for police */}
        {role === 'police' && setSelectedDataset && (
          <div className="dataset-toggle">
            {['historical', 'predicted', 'combined'].map(dataset => (
              <button
                key={dataset}
                className={`dataset-btn ${selectedDataset === dataset ? 'active' : ''}`}
                onClick={() => setSelectedDataset(dataset)}
              >
                {dataset.charAt(0).toUpperCase() + dataset.slice(1)}
              </button> 
            ))}
          </div>
        )}

        {/* Dark mode toggle */}
        {typeof setDarkMode === "function" && (
        <div className="dark-mode-toggle" style={{ margin: '0 10px' }}>
          <input
            type="checkbox"
            id="darkModeSwitch"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
          <label htmlFor="darkModeSwitch" className="switch"></label>
        </div>
      )}

        {/* Logout button */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default React.memo(Navbar);
