import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// ZoomHandler component for zooming to selected state
const ZoomHandler = ({ selectedState, stateBounds }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedState && selectedState !== 'All' && stateBounds[selectedState]) {
      map.fitBounds(stateBounds[selectedState], { padding: [50, 50] });
    } else {
      // Default India view
      map.setView([22.5937, 78.9629], 5);
    }
  }, [selectedState, map, stateBounds]);

  return null;
};

// DynamicHeatmap for a single crime type
const DynamicHeatmap = ({ data, gradient }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (map && data && data.length > 0) {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);

      const maxVal = Math.max(...data.map(p => p['Crime Count'] || 0));
      const heatData = data.map(p => [
        p.Latitude,
        p.Longitude,
        maxVal > 0 ? (p['Crime Count'] || 0) / maxVal : 0
      ]);

      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 12,
        blur: 15,
        minOpacity: 0.3,
        maxZoom: 12,
        gradient: gradient
      }).addTo(map);
    }

    return () => {
      if (map && heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, data, gradient]);

  return null;
};

// Main MapComponent
const MapComponent = ({ groupedMapData, selectedState }) => {
  const defaultCenter = [22.5937, 78.9629];
  const defaultZoom = 5;

  // Preset gradients
  const gradientPresets = [
    { 0.2: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'orange', 1.0: 'red' },
    { 0.2: 'purple', 0.5: 'pink', 0.8: 'red', 1.0: 'darkred' },
    { 0.2: 'green', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red' },
    { 0.2: 'navy', 0.5: 'blue', 0.8: 'aqua', 1.0: 'lime' },
    { 0.2: 'brown', 0.5: 'orange', 0.8: 'red', 1.0: 'black' }
  ];

  // Map crime types to gradients
  const crimeTypeGradientMap = {};
  Object.keys(groupedMapData).forEach((crimeType, idx) => {
    crimeTypeGradientMap[crimeType] = gradientPresets[idx % gradientPresets.length];
  });

  // Approximate bounding boxes for each state [southWestLat, southWestLng, northEastLat, northEastLng]
 const stateBounds = {
  "Andhra Pradesh": [[12.0, 76.0], [19.0, 84.5]],
  "Arunachal Pradesh": [[26.9, 91.2], [29.3, 97.1]],
  "Assam": [[24.0, 89.4], [28.3, 96.0]],
  "Bihar": [[24.0, 83.0], [27.5, 88.0]],
  "Chhattisgarh": [[17.5, 80.0], [24.0, 84.5]],
  "Goa": [[14.8, 73.7], [15.8, 74.2]],
  "Gujarat": [[20.0, 68.0], [24.8, 74.5]],
  "Haryana": [[27.6, 74.5], [30.9, 77.5]],
  "Himachal Pradesh": [[30.3, 75.9], [33.3, 79.5]],
  "Jharkhand": [[22.0, 83.0], [25.5, 87.5]],
  "Karnataka": [[11.5, 74.0], [18.5, 78.6]],
  "Kerala": [[8.0, 74.0], [12.8, 77.5]],
  "Madhya Pradesh": [[21.0, 74.0], [26.9, 82.0]],
  "Maharashtra": [[15.6, 72.6], [22.1, 80.9]],
  "Manipur": [[23.8, 93.0], [25.9, 94.8]],
  "Meghalaya": [[25.0, 89.8], [26.3, 92.0]],
  "Mizoram": [[21.9, 92.6], [24.3, 93.3]],
  "Nagaland": [[25.6, 93.4], [27.3, 95.3]],
  "Odisha": [[17.8, 81.3], [22.7, 87.5]],
  "Punjab": [[29.3, 73.8], [32.3, 76.9]],
  "Rajasthan": [[23.3, 69.3], [30.1, 78.0]],
  "Sikkim": [[27.0, 88.0], [28.0, 88.9]],
  "Tamil Nadu": [[8.0, 76.0], [13.5, 80.3]],
  "Telangana": [[15.7, 77.0], [19.5, 81.0]],
  "Tripura": [[22.5, 91.0], [24.0, 92.0]],
  "Uttar Pradesh": [[24.0, 77.0], [30.0, 84.0]],
  "Uttarakhand": [[28.9, 77.5], [31.2, 81.0]],
  "West Bengal": [[21.5, 85.0], [27.0, 89.9]],
  "Andaman & Nicobar Islands": [[6.5, 92.0], [13.0, 93.0]],
  "Chandigarh": [[30.7, 76.7], [30.8, 76.8]],
  "Dadra & Nagar Haveli and Daman & Diu": [[20.0, 72.8], [21.5, 73.5]],
  "Delhi": [[28.4, 76.8], [28.9, 77.4]],
  "Jammu & Kashmir": [[32.2, 72.5], [36.9, 80.0]],
  "Ladakh": [[32.5, 76.0], [36.0, 78.5]],
  "Lakshadweep": [[10.0, 71.0], [12.0, 73.5]],
  "Puducherry": [[11.9, 79.7], [12.0, 79.9]]
};


  return (
    <MapContainer center={defaultCenter} zoom={defaultZoom} className="leaflet-container" style={{ height: '100%', width: '100%' }}>
      <ZoomHandler selectedState={selectedState} stateBounds={stateBounds} />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        {Object.keys(groupedMapData).map(crimeType => (
          <LayersControl.Overlay
            key={crimeType}
            name={crimeType}
            checked={true}
          >
            <DynamicHeatmap
              data={groupedMapData[crimeType]}
              gradient={crimeTypeGradientMap[crimeType]}
            />
          </LayersControl.Overlay>
        ))}
      </LayersControl>
    </MapContainer>
  );
};

export default MapComponent;
