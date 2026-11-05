// The browser every tool launches. Wraps Playwright's chromium so a tool runs on any machine:
//
//   CHROMIUM_PATH=/path/to/chrome node tools/<tool>.mjs   use that browser
//
// Without CHROMIUM_PATH (PW_CHROMIUM is still read, for old notes) the browser Playwright installed is used; if
// it is missing (this repo pins a Playwright whose browser a machine may not have, as in cloud sessions where
// another Playwright put its browser in /opt/pw-browsers), the first browser found in FALLBACKS is used instead.
//
//   import { chromium, SOFTWARE_GL } from './browser.mjs';
//   const browser = await chromium.launch({ args: SOFTWARE_GL });
import { existsSync } from 'node:fs';
import { chromium as pw } from 'playwright';

/** Flags for WebGL on software (SwiftShader): every tool that draws the game needs them on a machine without a GPU. */
export const SOFTWARE_GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

const FALLBACKS = ['/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];

let picked;
/** The executablePath to launch with, or undefined for Playwright's own browser. */
export function browserPath() {
  if (picked !== undefined) return picked || undefined;
  const env = process.env.CHROMIUM_PATH || process.env.PW_CHROMIUM;
  if (env) picked = env;
  else {
    let own = '';
    try { own = pw.executablePath(); } catch { own = ''; }
    picked = own && existsSync(own) ? '' : FALLBACKS.find((p) => existsSync(p)) || '';
  }
  return picked || undefined;
}

function withPath(opts = {}) {
  const path = browserPath();
  if (!path || opts.executablePath) return opts;
  // A named channel ('chromium') asks Playwright for its own build; an explicit path replaces it.
  const { channel, ...rest } = opts;
  return { ...rest, executablePath: path };
}

export const chromium = {
  launch: (opts) => pw.launch(withPath(opts)),
  launchPersistentContext: (dir, opts) => pw.launchPersistentContext(dir, withPath(opts)),
};
