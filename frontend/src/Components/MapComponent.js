import React, { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { Map } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/* ---------------- INITIAL VIEW ---------------- */
const INITIAL_VIEW_STATE = {
  longitude: 78.9629,
  latitude: 22.5937,
  zoom: 4.8,
  pitch: 45,
  bearing: 0
};

const COLOR_SCHEMES = {
  historical: [
    [198, 219, 239],
    [158, 202, 225],
    [107, 174, 214],
    [66, 146, 198],
    [33, 113, 181],
    [8, 69, 148]
  ], // 🔵 Blue

  predicted: [
    [254, 224, 210],
    [252, 187, 161],
    [252, 146, 114],
    [251, 106, 74],
    [222, 45, 38],
    [165, 15, 21]
  ], // 🔴 Red

  combined: [
    [203, 201, 226],
    [158, 154, 200],
    [117, 107, 177],
    [106, 81, 163],
    [84, 39, 143],
    [63, 0, 125]
  ] // 🟣 Purple
};

/* ---------------- MAP COMPONENT ---------------- */
export default function MapComponent({
  groupedMapData = {},
  selectedCrimeTypes = [],
  selectedState = "All",
  selectedDataset = "historical"
}) {
  /* ---------- FLATTEN + FILTER DATA ---------- */
  const hexData = useMemo(() => {
    if (!groupedMapData || Object.keys(groupedMapData).length === 0) {
      return [];
    }

    const rows = [];

    Object.entries(groupedMapData).forEach(([crimeType, arr]) => {
      if (
        selectedCrimeTypes.length > 0 &&
        !selectedCrimeTypes.includes(crimeType)
      ) {
        return;
      }

      arr.forEach(d => {
        if (!d.Latitude || !d.Longitude) return;

        if (
          selectedState !== "All" &&
          d.State?.toLowerCase() !== selectedState.toLowerCase()
        ) {
          return;
        }

        rows.push(d);
      });
    });

    return rows;
  }, [groupedMapData, selectedCrimeTypes, selectedState]);

  /* ---------------- HEXAGON LAYER ---------------- */
  const layers = [];

// HISTORICAL
if (selectedDataset === "historical") {
  layers.push(
    new HexagonLayer({
      id: "historical-hex",
      data: hexData,
      getPosition: d => [Number(d.Longitude), Number(d.Latitude)],
      getElevationWeight: d => Number(d["Crime Count"] || 1),
      getColorWeight: d => Number(d["Crime Count"] || 1),
      elevationAggregation: "SUM",
      colorAggregation: "SUM",
      radius: selectedState === "All" ? 20000 : 8000,
      elevationScale: 35,
      extruded: true,
      opacity: 0.85,
      coverage: 0.9,
      colorRange: COLOR_SCHEMES.historical,
      pickable: true
    })
  );
}

// PREDICTED
if (selectedDataset === "predicted") {
  layers.push(
    new HexagonLayer({
      id: "predicted-hex",
      data: hexData,
      getPosition: d => [Number(d.Longitude), Number(d.Latitude)],
      getElevationWeight: d => Number(d["Predicted Risk"] || 1),
      getColorWeight: d => Number(d["Predicted Risk"] || 1),
      elevationAggregation: "SUM",
      colorAggregation: "SUM",
      radius: selectedState === "All" ? 18000 : 7000,
      elevationScale: 45,
      extruded: true,
      opacity: 0.9,
      coverage: 0.9,
      colorRange: COLOR_SCHEMES.predicted,
      pickable: true
    })
  );
}

// COMBINED (Decision View)
if (selectedDataset === "combined") {
  layers.push(
    new HexagonLayer({
      id: "historical-combined",
      data: hexData,
      getPosition: d => [Number(d.Longitude), Number(d.Latitude)],
      getElevationWeight: d => Number(d["Crime Count"] || 1),
      elevationAggregation: "SUM",
      radius: 20000,
      elevationScale: 25,
      extruded: true,
      opacity: 0.4,
      colorRange: COLOR_SCHEMES.historical
    }),
    new HexagonLayer({
      id: "predicted-combined",
      data: hexData,
      getPosition: d => [Number(d.Longitude), Number(d.Latitude)],
      getElevationWeight: d => Number(d["Predicted Risk"] || 1),
      elevationAggregation: "SUM",
      radius: 16000,
      elevationScale: 45,
      extruded: true,
      opacity: 0.7,
      colorRange: COLOR_SCHEMES.predicted
    })
  );
}

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller
      layers={layers}
      style={{ width: "100%", height: "100%" }}
      getTooltip={({ object }) =>
        object && {
          text: `Crime Count: ${object.elevationValue}`
        }
      }
    >
      {/* 🗺️ MAPLIBRE BASE MAP */}
      <Map
        reuseMaps
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </DeckGL>
  );
}