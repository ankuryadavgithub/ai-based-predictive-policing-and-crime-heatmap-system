import { GeoJsonLayer } from "@deck.gl/layers";

export function createBorderLayer(geojson) {
  return new GeoJsonLayer({
    id: "state-borders",
    data: geojson,
    stroked: true,
    filled: false,
    lineWidthMinPixels: 1.5,
    getLineColor: [56, 189, 248]
  });
}
