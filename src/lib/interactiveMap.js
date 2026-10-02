export const EMPTY_MAP_STATE = { fog_enabled: false, revealed: [], markers: [] };
export const clamp = (value) => Math.max(1, Math.min(99, value));
export const cellAt = (x, y) => Math.min(14, Math.floor(y * 15 / 100)) * 20 + Math.min(19, Math.floor(x * 20 / 100));
export const mapPoint = (event, element) => {
  const rect = element.getBoundingClientRect();
  return { x: clamp((event.clientX - rect.left) / rect.width * 100), y: clamp((event.clientY - rect.top) / rect.height * 100) };
};
export const isVisible = (state, marker) => !state.fog_enabled || (state.revealed || []).includes(cellAt(marker.x, marker.y));