"""Bake the CC0 photo sources (Poly Haven, public domain) into the two small textures the renderer reads:

    assets/textures/ground-detail.png   256 x 1024, four 256² tiles stacked: grass, soil, sand, rock (src/render/terrain.js)
                                        R = the photo's light and shade, G = its height (displacement), both high-passed
                                        around 0.5, so they add fine detail to the painted ground without changing its colour
    assets/textures/sky-detail.png      512 x 128, the upper half of a cloudy sky (zenith at the top row, horizon at the
                                        bottom; src/render/shading.js): R = brightness against the plain sky gradient
                                        (0.5 = the gradient, 1.0 = twice as bright), G = how much of the pixel is cloud

Download the sources into one folder (1K files):
    https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_48d_partly_cloudy_puresky_1k.hdr
    https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/<name>/<name>_diff_1k.jpg and _disp_1k.jpg for
    forrest_ground_01 (grass), coast_sand_01 (soil), aerial_beach_01 (sand), aerial_rocks_02 (rock)
then:
    ffmpeg -i kloofendal_48d_partly_cloudy_puresky_1k.hdr -pix_fmt gbrpf32le -f rawvideo sky.raw
    python3 tools/cc0/bake.py --src <folder> [--out assets/textures]

Needs numpy and Pillow. Every source is CC0 (https://polyhaven.com/license); see assets/textures/CREDITS.md.
"""
import argparse, os

import numpy as np
from PIL import Image

GROUND = [('grass', 'forrest_ground_01'), ('soil', 'coast_sand_01'), ('sand', 'aerial_beach_01'), ('rock', 'aerial_rocks_02')]
TILE = 256
SKY = 'kloofendal_48d_partly_cloudy_puresky'


def blur_wrap(a, sigma):
    """Gaussian blur that wraps around the edges (the sources tile), through the FFT."""
    h, w = a.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    g = np.exp(-2 * (np.pi * sigma) ** 2 * (fx * fx + fy * fy))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * g))


def load_gray(path, size):
    im = Image.open(path).convert('RGB').resize((size, size), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float64) / 255.0
    lin = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    return lin @ np.array([0.2126, 0.7152, 0.0722])


def ground_tile(src, name):
    light = load_gray(os.path.join(src, f'{name}_diff_1k.jpg'), TILE)
    ratio = light / np.maximum(blur_wrap(light, 18), 1e-4)  # shade against the local average: 1 = no change
    r = np.clip(0.5 + (ratio - 1.0) * 0.5, 0, 1)
    h = load_gray(os.path.join(src, f'{name}_disp_1k.jpg'), TILE)
    h = h - blur_wrap(h, 24)
    h = h / max(h.std(), 1e-6)
    g = np.clip(0.5 + h * 0.16, 0, 1)
    return r, g


def sky(src):
    W, H = 1024, 512
    raw = np.fromfile(os.path.join(src, 'sky.raw'), dtype='<f4').reshape(3, H, W)
    g, b, r = raw  # gbrp plane order
    up = slice(0, H // 2)
    r, g, b = r[up], g[up], b[up]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    lum = np.minimum(lum, np.percentile(lum, 99.0))  # the sun's disc is the renderer's own
    base = np.median(lum, axis=1, keepdims=True)  # the plain gradient, row by row
    ratio = lum / np.maximum(base, 1e-6)
    mx = np.maximum(np.maximum(r, g), b)
    sat = 1 - np.minimum(np.minimum(r, g), b) / np.maximum(mx, 1e-6)
    sky_sat = np.median(sat, axis=1, keepdims=True)
    cloud = np.clip((sky_sat - sat) / np.maximum(sky_sat * 0.6, 1e-3), 0, 1) * np.clip((ratio - 0.85) * 3, 0, 1)
    img = np.stack([np.clip(ratio / 2, 0, 1), cloud, np.zeros_like(cloud)], -1)
    im = Image.fromarray((img * 255 + 0.5).astype(np.uint8)).resize((512, 128), Image.LANCZOS)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    ap.add_argument('--out', default='assets/textures')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    rows = []
    for _label, name in GROUND:
        r, g = ground_tile(a.src, name)
        rows.append(np.stack([r, g, np.full_like(r, 0.5)], -1))
    img = np.concatenate(rows, 0)
    Image.fromarray((img * 255 + 0.5).astype(np.uint8)).save(os.path.join(a.out, 'ground-detail.png'), optimize=True)
    sky(a.src).save(os.path.join(a.out, 'sky-detail.png'), optimize=True)
    for f in ('ground-detail.png', 'sky-detail.png'):
        p = os.path.join(a.out, f)
        print(p, os.path.getsize(p), 'bytes')


if __name__ == '__main__':
    main()
