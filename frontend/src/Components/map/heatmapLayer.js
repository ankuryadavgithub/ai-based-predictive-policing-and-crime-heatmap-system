import { HexagonLayer } from "@deck.gl/aggregation-layers";

export function createHeatmapLayer(data, weightField, mode = "historical") {
  const isPredicted = mode === "predicted";

  return new HexagonLayer({
    id: isPredicted
      ? "crime-hex-predicted"
      : "crime-hex-historical",

    data,

    getPosition: d => [
      Number(d.Longitude),
      Number(d.Latitude)
    ],

    getElevationWeight: d => Number(d[weightField]) || 0,
    elevationAggregation: "SUM",

    radius: 5000,
    elevationScale: 40,
    extruded: true,

    opacity: 0.65,
    coverage: 0.9,
    pickable: true,

    colorRange: isPredicted
      ? [
          [220, 252, 231],
          [187, 247, 208],
          [134, 239, 172],
          [74, 222, 128],
          [22, 163, 74]
        ]
      : [
          [237, 248, 251],
          [179, 205, 227],
          [140, 150, 198],
          [136, 86, 167],
          [129, 15, 124]
        ]
  });
}
