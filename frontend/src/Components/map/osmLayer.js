// frontend/js/map/osmLayer.js
const { TileLayer, BitmapLayer } = deck;

export function createOSMLayer() {
  return new TileLayer({
    id: "osm-base",

    // deck.gl manages x/y/z internally
    data: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",

    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: props => {
      // 🔒 critical guard
      if (!props.tile || !props.data) return null;

      const { west, south, east, north } = props.tile.bbox;

      return new BitmapLayer({
        id: props.id,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  });
}
