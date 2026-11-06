// The live 3D portrait in the selection panel (DESIGN 8, "Selection portrait").
//
// The selected unit or building is drawn a second time each frame, close up, by its own camera, and copied
// into the panel's portrait canvas. Nothing is built for it: the entity's own model, doing whatever it is
// doing right now (walking, swinging, casting, half built, burning), is drawn out of the game's own scene
// through a camera that sees one layer: the model's meshes join that layer for the draw, and the scene's
// lights are on it for good. So the portrait is lit by the same sun, sky, fog and shadow map as the field,
// and every material keeps the shader programs the field already compiled (a scene of its own, with other
// lights or no fog, would compile a new program for every material on first selection: a hitch each time).
// With post-processing the model draws into a small target of the same kind as the field's (same programs
// again) and one quad tone-maps it to a scissored corner of the canvas that the HUD covers; on Low it draws
// straight there, as the field does. drawImage then copies those pixels into the portrait canvas on the GPU.
// No second WebGL context, no geometry copied, no pixels read back to the CPU.
import * as THREE from 'three';

/** The layer the portrait camera sees (the scene's lights are on it too). */
export const PORTRAIT_LAYER = 7;

/** Camera framing per kind: field of view, how much of the frame the model fills, look-at height share, pitch, yaw. */
export const FRAMING = {
  unit: { fov: 30, fill: 0.5, aim: 0.64, pitch: 0.16, yaw: 0.5 },
  building: { fov: 30, fill: 0.62, aim: 0.38, pitch: 0.42, yaw: 0.65 },
};

/** Seconds per turn of a building's slow turntable. */
export const TURN_SECONDS = 40;

/**
 * Where the portrait camera sits for a target: a three-quarter view from in front of a unit (its facing
 * rotY) or from a slowly turning angle around a building. Pure, for tests.
 * @returns {{ eye: {x,y,z}, at: {x,y,z} }}
 */
export function portraitCamera(kind, pos, height, radius, rotY, t) {
  const f = FRAMING[kind] || FRAMING.unit;
  const h = Math.max(0.3, height);
  const at = { x: pos.x, y: pos.y + h * f.aim, z: pos.z };
  const span = kind === 'building' ? Math.max(h, radius * 1.6) : h * (1 - f.aim) * 2 + 0.2;
  const dist = (span * f.fill) / Math.tan((f.fov * Math.PI) / 360) + (kind === 'building' ? radius * 0.55 : radius * 0.6);
  // a unit faces +x at rotY 0 (the renderer sets rotation.y = -facing, facing = atan2(dy, dx))
  const yaw = kind === 'building' ? f.yaw + (t / TURN_SECONDS) * Math.PI * 2 : rotY + Math.PI / 2 + f.yaw;
  const ch = Math.cos(f.pitch);
  return {
    eye: { x: at.x + Math.sin(yaw) * ch * dist, y: at.y + Math.sin(f.pitch) * dist, z: at.z + Math.cos(yaw) * ch * dist },
    at,
  };
}

const QUAD_VS = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const QUAD_FS = /* glsl */ `
uniform sampler2D tColor;
uniform float uExposure;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tColor, vUv);
  gl_FragColor = vec4(c.rgb * uExposure, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class Portrait {
  /**
   * @param {THREE.WebGLRenderer} renderer the game's renderer (the portrait draws through it)
   * @param {THREE.Scene} scene the game's scene (lights, fog, environment and the models)
   */
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.05, 400);
    this.camera.layers.set(PORTRAIT_LAYER);
    this.canvas = null;
    this.ctx = null;
    this.target = null; // { kind, id, root, height, radius, color }
    this.rect = null; // the portrait canvas against the game canvas, CSS pixels
    this.rectAge = Infinity;
    this.lightAge = Infinity;
    this.clear = new THREE.Color(0x120d08);
    this._dark = new THREE.Color(0x0a0705);
    this._buf = new THREE.Vector2();
    this._prevClear = new THREE.Color();
    this.rt = null;
    this.quad = null;
  }

  /** The panel's <canvas> to draw into (null to stop). */
  setCanvas(canvas) {
    if (canvas === this.canvas) return;
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.rectAge = Infinity;
  }

  /** What to draw: a unit or building view's model root, its height and footprint radius, and the owner's colour. */
  setTarget(t) {
    if (!t || !t.root) {
      this.target = null;
      return;
    }
    if (this.target && this.target.id === t.id && this.target.root === t.root) return;
    this.target = { ...t };
    // the backdrop: the owner's colour, deep in shadow
    // (three converts the clear colour for the screen or the HDR target itself)
    this.clear.set(t.color || '#888888').lerp(this._dark, 0.9);
    this.rectAge = Infinity;
  }

  /** Measure the portrait canvas against the game canvas (cached: reading layout every frame forces a reflow). */
  measure(glCanvas) {
    if (this.rectAge < 30 && this.rect) {
      this.rectAge++;
      return this.rect;
    }
    this.rectAge = 0;
    const a = this.canvas.getBoundingClientRect();
    const g = glCanvas.getBoundingClientRect();
    this.rect = a.width > 4 && a.height > 4 && g.width > 0 ? { x: a.left - g.left, y: a.top - g.top, w: a.width, h: a.height, gw: g.width } : null;
    if (this.rect) {
      const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const w = Math.round(a.width * dpr);
      const h = Math.round(a.height * dpr);
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
    }
    return this.rect;
  }

  /** Put every light of the scene on the portrait layer too (rechecked now and then: VFX add lights). */
  syncLights() {
    if (this.lightAge < 120) {
      this.lightAge++;
      return;
    }
    this.lightAge = 0;
    this.scene.traverse((o) => {
      if (o.isLight) o.layers.enable(PORTRAIT_LAYER);
    });
  }

  /** A colour target of the same kind as the field's (post.js), so materials keep their programs. */
  targetFor(post, w, h) {
    const src = post.scene && post.scene.texture;
    if (!src) return null;
    if (this.rt && (this.rt.texture.type !== src.type || this.rt.texture.colorSpace !== src.colorSpace)) {
      this.rt.dispose();
      this.rt = null;
    }
    if (!this.rt) {
      this.rt = new THREE.WebGLRenderTarget(w, h, { type: src.type, format: src.format, depthBuffer: true, stencilBuffer: false, generateMipmaps: false });
      this.rt.texture.colorSpace = src.colorSpace;
      this.rt.texture.name = 'portrait';
    } else if (this.rt.width !== w || this.rt.height !== h) this.rt.setSize(w, h);
    if (!this.quad) {
      const mat = new THREE.ShaderMaterial({ uniforms: { tColor: { value: null }, uExposure: { value: 1 } }, vertexShader: QUAD_VS, fragmentShader: QUAD_FS, depthTest: false, depthWrite: false, toneMapped: true });
      mat.name = 'portrait-tonemap';
      this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      this.quad.frustumCulled = false;
      this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }
    return this.rt;
  }

  /**
   * Draw the portrait for this frame, after the field is on the canvas. `t` is seconds; `post` is the
   * post-processing pipeline when it is on (null on Low), `exposure` its look's exposure.
   */
  draw(t, post = null, exposure = 1) {
    const tg = this.target;
    const r = this.renderer;
    if (!tg || !this.ctx || typeof this.ctx.drawImage !== 'function' || !r || typeof r.setScissor !== 'function') return false;
    const root = tg.root;
    if (!root.parent) return false; // the entity's view was disposed this frame
    const glCanvas = r.domElement;
    const rect = this.measure(glCanvas);
    if (!rect) return false;
    const buf = r.getDrawingBufferSize(this._buf);
    const k = buf.x / Math.max(1, rect.gw);
    const bw = Math.max(8, Math.min(buf.x, Math.round(rect.w * k)));
    const bh = Math.max(8, Math.min(buf.y, Math.round(rect.h * k)));
    // the corner of the canvas where the portrait itself sits (the HUD covers it)
    const bx = Math.max(0, Math.min(buf.x - bw, Math.round(rect.x * k)));
    const byTop = Math.max(0, Math.min(buf.y - bh, Math.round(rect.y * k)));
    const by = buf.y - byTop - bh; // GL counts rows from the bottom

    const cam = portraitCamera(tg.kind, root.position, tg.height, tg.radius, root.rotation.y, t);
    this.camera.aspect = bw / bh;
    this.camera.fov = (FRAMING[tg.kind] || FRAMING.unit).fov;
    this.camera.position.set(cam.eye.x, cam.eye.y, cam.eye.z);
    this.camera.lookAt(cam.at.x, cam.at.y, cam.at.z);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.syncLights();

    const meshes = [];
    root.traverse((o) => {
      if (o.isMesh || o.isPoints || o.isLine) {
        o.layers.enable(PORTRAIT_LAYER);
        meshes.push(o);
      }
    });
    const wasVisible = root.visible;
    root.visible = true;
    const prevAuto = r.autoClear;
    const prevTone = r.toneMapping;
    const prevTarget = r.getRenderTarget();
    const prevAlpha = r.getClearAlpha();
    const prevShadow = r.shadowMap.autoUpdate;
    const prevBg = this.scene.background;
    r.getClearColor(this._prevClear);
    const pr = r.getPixelRatio();
    const rt = post ? this.targetFor(post, bw, bh) : null;
    try {
      r.shadowMap.autoUpdate = false; // the field's shadow map from this frame serves
      this.scene.background = null; // a colour background would clear over the backdrop
      r.autoClear = false;
      r.setClearColor(this.clear, 1);
      if (rt) {
        r.toneMapping = THREE.NoToneMapping;
        r.setRenderTarget(rt);
        r.clear(true, true, false);
        r.render(this.scene, this.camera);
        r.setRenderTarget(null);
        r.toneMapping = THREE.NeutralToneMapping;
        r.setViewport(bx / pr, by / pr, bw / pr, bh / pr);
        r.setScissor(bx / pr, by / pr, bw / pr, bh / pr);
        r.setScissorTest(true);
        this.quad.material.uniforms.tColor.value = rt.texture;
        this.quad.material.uniforms.uExposure.value = exposure;
        r.render(this.quad, this.quadCam);
      } else {
        r.setRenderTarget(null);
        r.toneMapping = THREE.NeutralToneMapping;
        r.setViewport(bx / pr, by / pr, bw / pr, bh / pr);
        r.setScissor(bx / pr, by / pr, bw / pr, bh / pr);
        r.setScissorTest(true);
        r.clear(true, true, false);
        r.render(this.scene, this.camera);
      }
    } finally {
      for (const o of meshes) o.layers.disable(PORTRAIT_LAYER);
      root.visible = wasVisible;
      r.setScissorTest(false);
      r.setRenderTarget(prevTarget);
      r.setViewport(0, 0, buf.x / pr, buf.y / pr);
      r.setClearColor(this._prevClear, prevAlpha);
      r.autoClear = prevAuto;
      r.toneMapping = prevTone;
      r.shadowMap.autoUpdate = prevShadow;
      this.scene.background = prevBg;
    }
    const c = this.canvas;
    this.ctx.drawImage(glCanvas, bx, byTop, bw, bh, 0, 0, c.width, c.height);
    return true;
  }

  dispose() {
    this.target = null;
    this.setCanvas(null);
    if (this.rt) this.rt.dispose();
    this.rt = null;
    if (this.quad) {
      this.quad.geometry.dispose();
      this.quad.material.dispose();
      this.quad = null;
    }
  }
}
