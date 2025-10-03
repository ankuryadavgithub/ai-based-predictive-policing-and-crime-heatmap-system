import React, { useRef, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// ZoomHandler component
const ZoomHandler = ({ selectedState, stateBounds }) => {
  const map = useMap();
  const bounds = useMemo(() => stateBounds[selectedState], [selectedState, stateBounds]);

  useEffect(() => {
    if (selectedState && selectedState !== 'All' && bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([22.5937, 78.9629], 5);
    }
  }, [selectedState, bounds, map]);

  return null;
};

// DynamicHeatmap component
const DynamicHeatmap = React.memo(({ data, gradient }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  const heatData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const maxVal = Math.max(...data.map(p => p['Crime Count'] || 0));
    return data.map(p => [
      p.Latitude,
      p.Longitude,
      maxVal > 0 ? (p['Crime Count'] || 0) / maxVal : 0
    ]);
  }, [data]);

  useEffect(() => {
    if (!map || heatData.length === 0) return;

    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);

    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 12,
      blur: 15,
      minOpacity: 0.3,
      maxZoom: 12,
      gradient: gradient
    }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, heatData, gradient]);

  return null;
});

// Main MapComponent
const MapComponent = ({ groupedMapData, selectedState }) => {
  const defaultCenter = [22.5937, 78.9629];
  const defaultZoom = 5;

  const gradientPresets = useMemo(() => [
    { 0.2: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'orange', 1.0: 'red' },
    { 0.2: 'purple', 0.5: 'pink', 0.8: 'red', 1.0: 'darkred' },
    { 0.2: 'green', 0.5: 'yellow', 0.8: 'orange', 1.0: 'red' },
    { 0.2: 'navy', 0.5: 'blue', 0.8: 'aqua', 1.0: 'lime' },
    { 0.2: 'brown', 0.5: 'orange', 0.8: 'red', 1.0: 'black' }
  ], []);

  const crimeTypeGradientMap = useMemo(() => {
    const map = {};
    Object.keys(groupedMapData).forEach((crimeType, idx) => {
      map[crimeType] = gradientPresets[idx % gradientPresets.length];
    });
    return map;
  }, [groupedMapData, gradientPresets]);

  // stateBounds can be outside component or memoized
  const stateBounds = useMemo(() => ({
    "Andhra Pradesh": [[12.0, 76.0], [19.0, 84.5]],
    // ... (other states remain unchanged)
    "Puducherry": [[11.9, 79.7], [12.0, 79.9]]
  }), []);

  if (!groupedMapData || Object.keys(groupedMapData).length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Map...</div>;
  }

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

export default React.memo(MapComponent);
