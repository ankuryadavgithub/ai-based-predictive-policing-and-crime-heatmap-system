// frontend/js/map/legend.js
export function renderLegend() {
  return `
    <div class="legend">
      <h4>Crime Intensity</h4>
      <div class="scale">
        <span style="background:#00f"></span> Low
        <span style="background:#f00"></span> High
      </div>
    </div>
  `;
}
