import React, { useState, useEffect, useMemo, useCallback } from 'react';


// Define mapping from CSV column names to meaningful labels
const crimeTypeLabels = {
  "murder": "Murder",
  "attempt_to_murder": "Attempt to Murder",
  "culpable_homicide_not_amounting_to_murder": "Culpable Homicide (Not Amounting to Murder)",
  "rape": "Rape",
  "custodial_rape": "Custodial Rape",
  "other_rape": "Other Rape",
  "kidnapping_&_abduction": "Kidnapping & Abduction",
  "kidnapping_and_abduction_of_women_and_girls": "Kidnapping & Abduction of Women/Girls",
  "kidnapping_and_abduction_of_others": "Kidnapping & Abduction of Others",
  "dacoity": "Dacoity",
  "preparation_and_assembly_for_dacoity": "Preparation & Assembly for Dacoity",
  "robbery": "Robbery",
  "burglary": "Burglary",
  "theft": "Theft",
  "auto_theft": "Auto Theft",
  "other_theft": "Other Theft",
  "riots": "Riots",
  "criminal_breach_of_trust": "Criminal Breach of Trust",
  "cheating": "Cheating",
  "counterfieting": "Counterfeiting",
  "arson": "Arson",
  "hurt/grevious_hurt": "Hurt / Grievous Hurt",
  "dowry_deaths": "Dowry Deaths",
  "assault_on_women_with_intent_to_outrage_her_modesty": "Assault on Women (Intent to Outrage Modesty)",
  "insult_to_modesty_of_women": "Insult to Women's Modesty",
  "cruelty_by_husband_or_his_relatives": "Cruelty by Husband/Relatives",
  "importation_of_girls_from_foreign_countries": "Importation of Girls from Foreign Countries",
  "causing_death_by_negligence": "Causing Death by Negligence",
  "other_ipc_crimes": "Other IPC Crimes",
  "total_ipc_crimes": "Total IPC Crimes"
};

function FilterPanel({
  states = [],
  crimeTypes = [],
  years = [],
  selectedState,
  setSelectedState,
  selectedCrimeTypes,
  setSelectedCrimeTypes,
  selectedYear,
  setSelectedYear,
}) {
  // ---------------- Handlers ----------------
  const handleCrimeTypeChange = useCallback((event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedCrimeTypes([...selectedCrimeTypes, value]);
    } else {
      setSelectedCrimeTypes(selectedCrimeTypes.filter(ct => ct !== value));
    }
  }, [selectedCrimeTypes, setSelectedCrimeTypes]);

  const handleYearChange = useCallback((event) => {
    setSelectedYear(event.target.value);
  }, [setSelectedYear]);

  // ---------------- Slider Range ----------------
  const numericYears = useMemo(() => years.filter(y => y !== 'All').map(Number), [years]);
  const minYear = numericYears.length ? Math.min(...numericYears) : 2000;
  const maxYear = numericYears.length ? Math.max(...numericYears) : 2025;

  // ---------------- Filtered Crime Types ----------------
  const filteredCrimeTypes = useMemo(() => crimeTypes.filter(ct =>
    !['All','population','population.1','year','city','state','lat','lng'].includes(ct)
  ), [crimeTypes]);

  return (
    <div className="filter-panel">
      <h3>Filters</h3>

      {/* State Dropdown */}
      <div className="filter-group">
        <label htmlFor="state-select">State:</label>
        <select
          id="state-select"
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
        >
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {/* Crime Type Multi-Select */}
      <div className="filter-group">
        <label>Crime Types:</label>
        <div className="crime-type-checkboxes" style={{ maxHeight: '150px', overflowY: 'auto' }}>
          {filteredCrimeTypes.map(type => (
            <div key={type}>
              <input
                type="checkbox"
                id={`crime-${type}`}
                value={type}
                checked={selectedCrimeTypes.includes(type)}
                onChange={handleCrimeTypeChange}
              />
              <label htmlFor={`crime-${type}`}>
                {crimeTypeLabels[type] || type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Year Slider */}
      <div className="filter-group">
        <label htmlFor="year-slider">Year: {selectedYear}</label>
        <input
          type="range"
          id="year-slider"
          min={minYear}
          max={maxYear}
          step={1}
          value={selectedYear === 'All' ? minYear : selectedYear}
          onChange={handleYearChange}
        />
        <div className="year-range-labels" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FilterPanel);
