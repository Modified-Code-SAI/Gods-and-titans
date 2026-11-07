// Settings' Restore defaults (DESIGN 9, "Settings"): every setting back to its default except the name,
// the tips already seen, the player list's fold and the keys, which the Keys tab resets on its own.
import test from 'node:test';
import assert from 'node:assert/strict';
import { saveSettings, getSettings, defaultSettings, restoreDefaults, KEPT_ON_RESTORE, _resetSettingsForTests } from '../../src/settings.js';

test('Restore defaults resets the rest and keeps the name, tips seen and keys', () => {
  _resetSettingsForTests({ clearStorage: true });
  saveSettings({ name: 'Ann', volume: 0.2, quality: 'ultra', alerts: 'off', showFps: true, tipsDismissed: true, cardKeys: 'grid', keyBindings: { cam_jump: 'J' } });
  const after = restoreDefaults();
  const d = defaultSettings();
  assert.equal(after.name, 'Ann');
  assert.equal(after.tipsDismissed, true);
  assert.equal(after.cardKeys, 'grid');
  assert.deepEqual({ ...after.keyBindings }, { cam_jump: 'J' });
  for (const k of ['volume', 'quality', 'alerts', 'showFps', 'musicVolume', 'uiScale']) assert.deepEqual(after[k], d[k], k);
  assert.deepEqual(getSettings(), after);
  assert.deepEqual([...KEPT_ON_RESTORE].sort(), ['cardKeys', 'keyBindings', 'name', 'rosterOpen', 'tipsDismissed']);
});
