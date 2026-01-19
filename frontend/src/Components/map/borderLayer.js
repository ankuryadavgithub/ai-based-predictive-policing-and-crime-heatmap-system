// frontend/js/map/borderLayer.js
const { GeoJsonLayer } = deck;

export function createBorderLayer(geojson) {
  return new GeoJsonLayer({
    id: "state-borders",
    data: geojson,
    stroked: true,
    filled: false,
    lineWidthMinPixels: 1,
    getLineColor: [56, 189, 248]
  });
}
