// Attack range rings (DESIGN 8, "Range rings"): a dashed band draped on the terrain, around a tower or Town
// Center that shoots, shown under the placement ghost and while such a building is selected. The band sits at
// the edge of what the building reaches (its attack range plus half its footprint: the sim measures from the
// building's edge), with a faint wash inside so the covered ground reads at a glance.
import * as THREE from 'three';
import { heightAt } from './height.js';

const RING_VS = `
attribute vec2 aRing;
varying vec2 vRing;
void main() {
  vRing = aRing;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

// vRing.x runs around the ring in world units (for the dashes), vRing.y across the band: 0 at the inner edge
// of the wash, WASH at the band's inner edge, 1 at its outer edge.
const RING_FS = `
uniform vec3 uColor;
uniform float uAlpha;
uniform float uTime;
uniform float uWash;
varying vec2 vRing;
void main() {
  float v = vRing.y;
  float band = smoothstep( uWash, uWash + 0.04, v ) * ( 1.0 - smoothstep( 0.93, 1.0, v ) );
  float dash = smoothstep( 0.2, 0.32, fract( vRing.x * 0.9 - uTime * 0.35 ) );
  float wash = smoothstep( 0.0, uWash, v ) * ( 1.0 - step( uWash, v ) ) * 0.22;
  float a = ( band * ( 0.55 + 0.45 * dash ) + wash ) * uAlpha;
  if ( a < 0.003 ) discard;
  gl_FragColor = vec4( uColor * ( 1.0 + 0.35 * band ), a );
  #include <colorspace_fragment>
}`;

export const RING_SEGMENTS = 160;
const BAND = 0.16; // band width in world units
const WASH = 0.9; // width of the wash inside the band

/** Reach of a building's attack from its centre: range plus upgrades, plus half its footprint. 0 when it has none. */
export function buildingReach(def, bonus = 0) {
  if (!def || !def.attack || !(def.attack.range > 0)) return 0;
  return def.attack.range + (Number.isFinite(bonus) ? bonus : 0) + (def.size || 0) / 2;
}

/**
 * Vertices of a ring draped on the terrain: `segments + 1` pairs (inner, outer), each lifted just off the ground.
 * @returns {{ pos: Float32Array, ring: Float32Array }}
 */
export function ringVertices(map, x, z, radius, segments = RING_SEGMENTS, out = null) {
  const n = segments + 1;
  const pos = out ? out.pos : new Float32Array(n * 2 * 3);
  const ring = out ? out.ring : new Float32Array(n * 2 * 2);
  const inner = Math.max(0.2, radius - BAND - WASH);
  const outer = radius;
  const wash = WASH / (outer - inner);
  const around = (2 * Math.PI * radius) / segments;
  for (let i = 0; i < n; i++) {
    const a = (i / segments) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    for (let k = 0; k < 2; k++) {
      const r = k ? outer : inner;
      const px = x + c * r;
      const pz = z + s * r;
      const o = (i * 2 + k) * 3;
      pos[o] = px;
      pos[o + 1] = (map ? Math.max(heightAt(map, px, pz), -0.2) : 0) + 0.07;
      pos[o + 2] = pz;
      ring[(i * 2 + k) * 2] = i * around;
      ring[(i * 2 + k) * 2 + 1] = k ? 1 : 0;
    }
  }
  return { pos, ring, wash: Math.min(0.95, wash) };
}

/** One range ring. set() re-drapes it only when the centre or radius change. */
export class RangeRing {
  constructor(parent, map, segments = RING_SEGMENTS) {
    this.map = map;
    this.segments = segments;
    const n = segments + 1;
    this.buf = { pos: new Float32Array(n * 2 * 3), ring: new Float32Array(n * 2 * 2) };
    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.buf.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.ringAttr = new THREE.BufferAttribute(this.buf.ring, 2).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('aRing', this.ringAttr);
    const idx = [];
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geo.setIndex(idx);
    this.uniforms = { uColor: { value: new THREE.Color(1, 1, 1) }, uAlpha: { value: 0 }, uTime: { value: 0 }, uWash: { value: 0.5 } };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: RING_VS,
      fragmentShader: RING_FS,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    this.material.name = 'range-ring';
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = 'range-ring';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 4;
    this.mesh.visible = false;
    parent.add(this.mesh);
    this.key = '';
    this.alpha = 0; // fades in over a few frames
    this.target = 0;
  }

  /** Show the ring around world (x, z) with this radius and colour; strength 0..1 scales its opacity. */
  set(x, z, radius, color, strength = 1) {
    if (!(radius > 0)) return this.hide();
    const key = `${x.toFixed(2)},${z.toFixed(2)},${radius.toFixed(2)}`;
    if (key !== this.key) {
      this.key = key;
      const v = ringVertices(this.map, x, z, radius, this.segments, this.buf);
      this.uniforms.uWash.value = v.wash;
      this.posAttr.needsUpdate = true;
      this.ringAttr.needsUpdate = true;
      this.mesh.geometry.computeBoundingSphere();
    }
    if (color) this.uniforms.uColor.value.copy(color);
    if (!this.mesh.visible) this.alpha = 0;
    this.target = strength;
    this.mesh.visible = true;
  }

  hide() {
    this.mesh.visible = false;
    this.target = 0;
  }

  get visible() {
    return this.mesh.visible;
  }

  update(dt, time) {
    this.uniforms.uTime.value = time;
    if (!this.mesh.visible) return;
    this.alpha += (this.target - this.alpha) * Math.min(1, dt * 10);
    this.uniforms.uAlpha.value = this.alpha;
  }

  dispose() {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
