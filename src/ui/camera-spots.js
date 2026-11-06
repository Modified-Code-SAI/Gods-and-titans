// Camera spots (DESIGN 9, "Camera spots"): four places on the map the player keeps for the match, as an RTS does.
// Ctrl+F6..F9 (or Shift+F6..F9, where the system keeps Ctrl with a function key) saves where the camera looks and
// how far out it is; F6..F9 brings it back there. F5 stays the browser's reload, F10 the menu, F11 and F12 the
// browser's own. The spots last for the match only (a new match starts with none). Pure, so Node tests drive it.

/** The keys of the four spots, in order. */
export const CAMERA_SPOT_KEYS = ['F6', 'F7', 'F8', 'F9'];

/**
 * What a key press means for the spots: { slot, save } (slot 0..3), or null when it is not one of their keys.
 * @param {{ key?: string, ctrlKey?: boolean, metaKey?: boolean, shiftKey?: boolean, altKey?: boolean }} e
 */
export function cameraSpotKey(e) {
  const slot = CAMERA_SPOT_KEYS.indexOf(e && e.key);
  if (slot < 0 || e.altKey) return null;
  return { slot, save: !!(e.ctrlKey || e.metaKey || e.shiftKey) };
}

export class CameraSpots {
  constructor() {
    this.spots = CAMERA_SPOT_KEYS.map(() => null);
  }

  /** Keep where `camera` looks now (its goal, so a camera still gliding keeps where it is going) in slot i. */
  save(i, camera) {
    if (!camera || !(i >= 0 && i < this.spots.length)) return false;
    const at = camera.goal || camera.target;
    const d = Number.isFinite(camera.goalDistance) ? camera.goalDistance : camera.distance;
    if (!at || !Number.isFinite(at.x) || !Number.isFinite(at.y)) return false;
    this.spots[i] = { x: at.x, y: at.y, d: Number.isFinite(d) ? d : null };
    return true;
  }

  /** Send `camera` to slot i (at once, and at the distance it was saved at). False when the slot is empty. */
  recall(i, camera) {
    const s = this.spots[i];
    if (!s || !camera) return false;
    camera.centerOn(s.x, s.y);
    if (s.d !== null && typeof camera.setDistance === 'function') camera.setDistance(s.d);
    return true;
  }

  has(i) {
    return !!this.spots[i];
  }
}

/** The feed's line for a press: saved, or brought back, or an empty spot with how to fill it. */
export function cameraSpotLine(slot, save, ok) {
  const key = CAMERA_SPOT_KEYS[slot];
  if (save) return ok ? `Camera spot ${key} saved. Press ${key} to come back here.` : '';
  return ok ? '' : `No camera spot on ${key} yet: Ctrl+${key} saves one.`;
}
