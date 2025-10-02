import React from 'react';
 // separate CSS for styling

function Navbar({ selectedDataset, setSelectedDataset, darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">AI Crime Dashboard</h1>
      </div>
      <div className="navbar-right">
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
      </div>
<div className="dark-mode-toggle">
  <input
    type="checkbox"
    id="darkModeSwitch"
    checked={darkMode}
    onChange={() => setDarkMode(prev => !prev)}
  />
  <label htmlFor="darkModeSwitch" className="switch"></label>
</div>


    </nav>
  );
}

export default Navbar;
