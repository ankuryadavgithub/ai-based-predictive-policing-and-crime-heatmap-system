// frontend/js/map/heatmapLayer.js
const { HexagonLayer } = deck;

/**
 * Hexagon-based spatial aggregation layer
 * Radius is in METERS (world space)
 */
export function createHeatmapLayer(data, weightField) {
  return new HexagonLayer({
    id: "crime-hexagon-layer",

    data,

    getPosition: d => [
      Number(d.longitude),
      Number(d.latitude)
    ],

    getWeight: d => Number(d[weightField]) || 1,

    // 🔥 REAL-WORLD SPATIAL PARAMETERS
    radius: 5000,          // 5 km hexagon radius
    elevationScale: 40,    // height multiplier
    elevationRange: [0, 3000],
    extruded: true,

    // 🔥 VISUAL QUALITY
    opacity: 0.6,
    coverage: 0.9,

    // 🔥 COLOR SCALE (low → high crime)
    colorRange: [
      [237, 248, 251],
      [179, 205, 227],
      [140, 150, 198],
      [136, 86, 167],
      [129, 15, 124]
    ],

    pickable: true
  });
}
