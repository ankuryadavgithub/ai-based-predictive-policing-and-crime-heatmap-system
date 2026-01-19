// frontend/js/map/mapCore.js
const { Deck } = deck;

export let deckInstance = null;

export function initMap(layers) {
  deckInstance = new Deck({
    container: "map",
    initialViewState: {
      latitude: 20.5937,
      longitude: 78.9629,
      zoom: 4,
      pitch: 45
    },
    controller: true,
    layers
  });
}

export function updateMap(layers) {
  if (deckInstance) {
    deckInstance.setProps({ layers });
  }
}
