import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";

export function createOSMLayer() {
  return new TileLayer({
    id: "osm-base",
    data: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: props => {
      if (!props.tile || !props.data) return null;

      const { west, south, east, north } = props.tile.bbox;

      return new BitmapLayer(props, {
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  });
}
