import React, { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { GeoJsonLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";

/* ---------------- VIEW ---------------- */
const INITIAL_VIEW_STATE = {
  longitude: 78.9629,
  latitude: 22.5937,
  zoom: 4.5,
  pitch: 0,
  bearing: 0
};

/* ---------------- CRIME COLORS ---------------- */
const CRIME_COLORS = {
  murder: [220, 38, 38],
  rape: [168, 85, 247],
  theft: [14, 165, 233],
  robbery: [245, 158, 11],
  total_ipc_crimes: [34, 197, 94],
  default: [59, 130, 246]
};

const normalizeCrimeKey = key =>
  key.toLowerCase().replace(/[^a-z0-9]+/g, "_");

/* ---------------- MAP COMPONENT ---------------- */
export default function MapComponent({
  groupedMapData,
  selectedCrimeType = "ALL",
  selectedState = "All",
  indiaStateGeoJson
}) {
  /* ---------- Build Heatmap Data ---------- */
  const heatmapData = useMemo(() => {
    let rows = [];

    if (!groupedMapData) return [];

    if (selectedCrimeType === "ALL") {
      Object.values(groupedMapData).forEach(arr => rows.push(...arr));
    } else {
      rows = groupedMapData[selectedCrimeType] || [];
    }

    return rows.filter(
      r =>
        r.lat &&
        r.lng &&
        (selectedState === "All" ||
          r.state?.toLowerCase() === selectedState.toLowerCase())
    );
  }, [groupedMapData, selectedCrimeType, selectedState]);

  const crimeKey = normalizeCrimeKey(selectedCrimeType);
  const color = CRIME_COLORS[crimeKey] || CRIME_COLORS.default;

  /* ---------------- LAYERS ---------------- */
  const layers = [
    /* 🗺️ Base Map (Light, Sharp, No API) */
    new TileLayer({
      data: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: props => {
        const {
          bbox: { west, south, east, north }
        } = props.tile;

        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [west, south, east, north]
        });
      }
    }),

    /* 🔥 Crime Heatmap */
    new HeatmapLayer({
      id: "crime-heatmap",
      data: heatmapData,
      getPosition: d => [Number(d.lng), Number(d.lat)],
      getWeight: d => Number(d["Crime Count"] || d.value || 1),
      radiusPixels: 45,
      intensity: 1,
      threshold: 0.03,
      colorRange: [
        [color[0], color[1], color[2], 60],
        [color[0], color[1], color[2], 120],
        [color[0], color[1], color[2], 200]
      ]
    }),

    /* 🧱 State Borders (ON TOP) */
    indiaStateGeoJson &&
      new GeoJsonLayer({
        id: "india-states",
        data: indiaStateGeoJson,
        stroked: true,
        filled: false,
        getLineColor: [0, 0, 0, 220],
        getLineWidth: 2,
        lineWidthMinPixels: 2
      })
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
