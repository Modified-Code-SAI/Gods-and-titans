// What a battle leaves behind (render only; the sim forgets the dead at once):
//   - the fallen stay down: a dead unit topples as before, then lies where it fell for CORPSE.hold
//     seconds before it sinks away. Once it has settled its pose is frozen (no per-frame animation),
//     and at most corpseCap(quality) lie at once: past that the oldest sink early.
//   - a building that comes down leaves a pile of rubble on its footprint and a scorch on the ground,
//     for RUBBLE.seconds; then the stones sink into the earth. Building on the spot clears it.
// Rubble is two instanced meshes (stone chunks, blocks and beams): two draw calls in all, buffers
// rewritten only when a pile is added, cleared or sinking.
import * as THREE from 'three';
import { patchWorldMaterial } from './shading.js';
import { patchFowObject } from './fog.js';

export const CORPSE = Object.freeze({
  hold: 14, // seconds from the death to the start of the sink
  sink: 0.65, // seconds the sink takes
  settle: 1.3, // after this the fallen pose is still: no more animation until the sink
  spiritHold: 0.95, // shades and banshees fade at once, as before (nothing to leave behind)
});

const CORPSE_CAP = { low: 12, medium: 28, high: 44, ultra: 60 };

/** How many fallen units may lie on the field at once at a quality tier. */
export function corpseCap(quality) {
  return CORPSE_CAP[quality] ?? CORPSE_CAP.medium;
}

/**
 * Seconds a dead unit lies before it sinks.
 * @param {object|undefined} def its UNITS entry
 * @param {{ kind?: string }|undefined} model its model (kind 'spirit' for ghosts)
 */
export function corpseHold(def, model) {
  if (model && model.kind === 'spirit') return CORPSE.spiritHold;
  if (def && def.visual && def.visual.kind === 'spirit') return CORPSE.spiritHold;
  return CORPSE.hold;
}

/**
 * Over the cap the oldest bodies sink early. `list` is in order of death, each `{ dyingT, deathHold }`;
 * bodies still lying (dyingT < deathHold) past the newest `cap` get their hold cut to now (never before
 * they have settled). Returns how many were hurried.
 */
export function hurryCorpses(list, cap) {
  let lying = 0;
  for (const v of list) if (v.dyingT < v.deathHold) lying++;
  let excess = lying - cap;
  let n = 0;
  for (let i = 0; i < list.length && excess > 0; i++) {
    const v = list[i];
    if (v.dyingT >= v.deathHold) continue;
    v.deathHold = Math.max(v.dyingT, Math.min(v.deathHold, CORPSE.settle));
    excess--;
    n++;
  }
  return n;
}

/** Sink fraction 0..1 of a body at time d after death (0 while it lies, 1 gone). */
export function corpseSink(d, hold) {
  return Math.min(1, Math.max(0, (d - hold) / CORPSE.sink));
}

export const RUBBLE = Object.freeze({
  seconds: 75, // a pile lies this long in all
  sink: 4, // the last seconds of it, sinking
});

const RUBBLE_PILES = { low: 6, medium: 14, high: 24, ultra: 32 };
const MAX_CHUNKS = 2400;
const MAX_BLOCKS = 640;

const STONE_TONES = [0x9a9182, 0x8a8274, 0x7b7467, 0xa39b8b, 0x6d675c];
const DIRT_TONES = [0x7a6a56, 0x6c5d4b, 0x857563, 0x5f5244];
const CHAR_TONES = [0x4d463e, 0x3c3731];
const WOOD_TONES = [0x6e4c2f, 0x5a3d25, 0x7a5636];

function rng(seed) {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * The pieces of one pile, in tile units around the footprint's center (pure, seeded).
 * @param {number} size footprint side in tiles
 * @param {number} seed
 * @param {{ wood?: boolean, amount?: number }} [o] wood: a timber building (beams, no blocks); amount 0..1 (an unfinished building leaves less)
 * @returns {{ kind: 'chunk'|'block', x: number, z: number, sx: number, sy: number, sz: number, ry: number, rx: number, color: number }[]}
 */
export function rubblePieces(size, seed, { wood = false, amount = 1 } = {}) {
  const r = rng(seed * 7919 + size * 31);
  const s = Math.max(1, size);
  const area = s * s;
  const k = Math.max(0.25, Math.min(1, amount));
  const out = [];
  const spread = s * 0.5;
  const pick = (arr) => arr[Math.floor(r() * arr.length) % arr.length];
  const at = () => {
    // denser toward the middle, a little past the footprint's edge
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * spread * 1.05;
    return [Math.cos(a) * d, Math.sin(a) * d, d / (spread * 1.05)];
  };
  // a low mound of earth and broken plaster under it all
  const mound = Math.min(16, Math.round(1.2 * area * k));
  for (let i = 0; i < mound; i++) {
    const [x, z, d] = at();
    const base = (0.18 + 0.14 * r()) * (1 + 0.1 * s) * (1.2 - 0.6 * d);
    out.push({ kind: 'chunk', x: x * 0.6, z: z * 0.6, sx: base * 1.3, sy: base * 0.3, sz: base * 1.3, ry: r() * 6.283, rx: 0, color: pick(DIRT_TONES) });
  }
  const chunks = Math.min(90, Math.round(5 * area * k));
  for (let i = 0; i < chunks; i++) {
    const [x, z, d] = at();
    // big stones heaped in the middle, small ones scattered at the edge
    const base = (0.07 + 0.16 * r()) * (1 + 0.08 * s) * (1.35 - 0.6 * d);
    const color = wood ? (r() < 0.3 ? pick(STONE_TONES) : r() < 0.5 ? pick(CHAR_TONES) : pick(WOOD_TONES)) : r() < 0.28 ? pick(CHAR_TONES) : pick(STONE_TONES);
    out.push({ kind: 'chunk', x, z, sx: base * (0.8 + 0.5 * r()), sy: base * (0.55 + 0.4 * r()), sz: base * (0.8 + 0.5 * r()), ry: r() * 6.283, rx: (r() - 0.5) * 0.8, color });
  }
  const blocks = Math.min(26, Math.round((wood ? 1.6 : 1.3) * area * k));
  for (let i = 0; i < blocks; i++) {
    const [x, z] = at();
    const beam = wood || r() < 0.3;
    const len = beam ? 0.45 + 0.5 * r() * Math.min(2, s / 2) : 0.18 + 0.14 * r();
    const th = beam ? 0.07 + 0.05 * r() : 0.12 + 0.08 * r();
    const color = beam ? (r() < 0.35 ? pick(CHAR_TONES) : pick(WOOD_TONES)) : pick(STONE_TONES);
    out.push({ kind: 'block', x, z, sx: len, sy: th, sz: beam ? th : 0.16 + 0.1 * r(), ry: r() * 6.283, rx: (r() - 0.5) * (beam ? 0.7 : 0.35), color });
  }
  return out;
}

function chunkGeometry() {
  const g = new THREE.DodecahedronGeometry(1, 0).toNonIndexed();
  const p = g.attributes.position;
  const r = rng(11);
  // dent the corners so no two faces match: a broken stone, not a solid
  const seen = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    let f = seen.get(key);
    if (f === undefined) seen.set(key, (f = 0.78 + 0.3 * r()));
    p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f);
  }
  g.computeVertexNormals();
  return g;
}

function blockGeometry() {
  const g = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
  const p = g.attributes.position;
  const r = rng(5);
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.9 + 0.2 * r()), p.getY(i) * (0.9 + 0.2 * r()), p.getZ(i));
  g.computeVertexNormals();
  return g;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

/** Rubble piles where buildings fell, with their scorch marks. */
export class RubbleLayer {
  /**
   * @param {THREE.Object3D} parent
   * @param {(x: number, y: number) => number} heightFn ground height at a map point
   * @param {{ quality?: string }} [o]
   */
  constructor(parent, heightFn, { quality = 'medium' } = {}) {
    this.heightFn = heightFn;
    this.maxPiles = RUBBLE_PILES[quality] ?? RUBBLE_PILES.medium;
    this.piles = [];
    this.material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 });
    this.material.name = 'rubble';
    patchWorldMaterial(this.material, { cloud: true, rim: 0 });
    this.chunks = this.makeMesh(chunkGeometry(), MAX_CHUNKS, 'rubble-chunks');
    this.blocks = this.makeMesh(blockGeometry(), MAX_BLOCKS, 'rubble-blocks');
    this.group = new THREE.Group();
    this.group.name = 'rubble';
    this.group.add(this.chunks, this.blocks);
    patchFowObject(this.group);
    parent.add(this.group);
    this.dirty = false;
    this.disposed = false;
  }

  makeMesh(geo, max, name) {
    const mesh = new THREE.InstancedMesh(geo, this.material, max);
    mesh.name = name;
    mesh.count = 0;
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.setColorAt(0, _c.set(0xffffff));
    return mesh;
  }

  /**
   * A building fell here.
   * @param {number} x footprint center
   * @param {number} y
   * @param {number} size footprint side in tiles
   * @param {{ wood?: boolean, amount?: number, seed?: number }} [o]
   */
  add(x, y, size, { wood = false, amount = 1, seed = 1 } = {}) {
    if (this.disposed || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const pieces = rubblePieces(size, seed, { wood, amount });
    for (const pc of pieces) {
      pc.wx = x + pc.x;
      pc.wz = y + pc.z;
      pc.gy = this.heightFn(pc.wx, pc.wz);
    }
    this.piles.push({ x, y, size, t: 0, pieces, rot: (seed % 628) / 100, gy: this.heightFn(x, y), amount: Math.max(0.25, Math.min(1, amount)) });
    while (this.piles.length > this.maxPiles) this.piles.shift();
    this.dirty = true;
  }

  /** Clear the piles whose center lies in a rectangle (a new building goes up there). */
  clearRect(x0, y0, x1, y1) {
    const n = this.piles.length;
    this.piles = this.piles.filter((p) => p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1);
    if (this.piles.length !== n) this.dirty = true;
  }

  clear() {
    if (!this.piles.length) return;
    this.piles.length = 0;
    this.dirty = true;
  }

  update(dt) {
    if (this.disposed) return;
    let sinking = false;
    if (dt > 0) {
      let j = 0;
      for (const p of this.piles) {
        p.t += dt;
        if (p.t >= RUBBLE.seconds) {
          this.dirty = true;
          continue;
        }
        if (p.t > RUBBLE.seconds - RUBBLE.sink) sinking = true;
        this.piles[j++] = p;
      }
      this.piles.length = j;
    }
    if (this.dirty || sinking) this.rebuild();
    this.dirty = false;
  }

  rebuild() {
    let nc = 0;
    let nb = 0;
    const C = this.chunks;
    const B = this.blocks;
    for (const p of this.piles) {
      const u = Math.max(0, (p.t - (RUBBLE.seconds - RUBBLE.sink)) / RUBBLE.sink);
      const drop = u * u;
      for (const pc of p.pieces) {
        const mesh = pc.kind === 'chunk' ? C : B;
        const i = pc.kind === 'chunk' ? nc : nb;
        if (i >= (pc.kind === 'chunk' ? MAX_CHUNKS : MAX_BLOCKS)) continue;
        if (pc.kind === 'chunk') nc++;
        else nb++;
        // half buried, then sinking out of sight
        const y = pc.gy + pc.sy * 0.25 - drop * (pc.sy * 1.4 + 0.12);
        _p.set(pc.wx, y, pc.wz);
        _q.setFromEuler(_e.set(pc.rx, pc.ry, pc.rx * 0.5));
        _s.set(pc.sx, pc.sy, pc.sz);
        _m.compose(_p, _q, _s);
        mesh.setMatrixAt(i, _m);
        mesh.setColorAt(i, _c.set(pc.color));
      }
    }
    for (const [mesh, n] of [[C, nc], [B, nb]]) {
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * The scorch under each pile, for the ground blob layer: calls `fn(x, groundY, y, radius, rot, alpha)`.
   */
  scorches(fn) {
    for (const p of this.piles) {
      const fadeIn = Math.min(1, p.t / 0.6);
      const fadeOut = Math.min(1, (RUBBLE.seconds - p.t) / RUBBLE.sink);
      fn(p.x, p.gy, p.y, p.size * 0.85 + 0.5, p.rot, 0.9 * p.amount * fadeIn * fadeOut);
    }
  }

  stats() {
    return { piles: this.piles.length, chunks: this.chunks.count, blocks: this.blocks.count };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.group.removeFromParent();
    this.chunks.geometry.dispose();
    this.blocks.geometry.dispose();
    this.material.dispose();
    this.chunks.dispose();
    this.blocks.dispose();
  }
}
