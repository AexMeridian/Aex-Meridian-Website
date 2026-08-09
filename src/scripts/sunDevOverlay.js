// Phase 1 acceptance test, made physical: drag from -18 to +8 with scroll
// frozen and watch the whole site respond. Only mounted when ?sun-dev is in
// the URL (see the dynamic import in Layout.astro), so it never ships to a
// real visitor's bundle.

import { sun, setElevationOverride, clearElevationOverride, SUN_RANGE } from '../state/sun.js';

export function initSunDevOverlay(doc) {
  if (doc.getElementById('sun-dev-overlay')) return;

  const panel = doc.createElement('div');
  panel.id = 'sun-dev-overlay';
  panel.innerHTML = `
    <strong style="font-weight:600;">Sun dev</strong>
    <label style="display:flex; flex-direction:column; gap:4px;">
      <span>Elevation <span data-readout>${sun.elevation.toFixed(1)}&deg;</span></span>
      <input type="range" min="${SUN_RANGE.MIN_ELEVATION}" max="${SUN_RANGE.MAX_ELEVATION}" step="0.1" value="${sun.elevation}" data-slider />
    </label>
    <button type="button" data-release>Release (live scroll)</button>
  `;

  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: '2000',
    background: 'rgba(10, 14, 20, 0.92)',
    color: '#F7F5F0',
    padding: '14px 18px',
    borderRadius: '8px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: '220px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(247, 245, 240, 0.15)',
  });

  doc.body.appendChild(panel);

  const slider = panel.querySelector('[data-slider]');
  const readout = panel.querySelector('[data-readout]');
  const releaseButton = panel.querySelector('[data-release]');

  slider.addEventListener('input', () => {
    const value = parseFloat(slider.value);
    setElevationOverride(value);
    readout.textContent = `${value.toFixed(1)}°`;
  });

  releaseButton.addEventListener('click', () => {
    clearElevationOverride();
  });
}
