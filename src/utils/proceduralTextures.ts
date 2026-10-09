/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CelestialBody, PlanetType } from '../types/space';

// Helper to create a 2D canvas of specified dimensions
function createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  return { canvas, ctx };
}

// Simple deterministic pseudo-random or hash
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate Sun procedural texture
export function createSunTexture(baseColor = '#FDB813', emissiveColor = '#FF4500'): THREE.CanvasTexture {
  const size = 1024;
  const { canvas, ctx } = createCanvas(size, size);

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, emissiveColor);
  grad.addColorStop(0.5, baseColor);
  grad.addColorStop(1, '#FFEAA7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Solar convection cells / granulations
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 35;
    const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    radial.addColorStop(0.4, 'rgba(255, 200, 50, 0.3)');
    radial.addColorStop(1, 'rgba(255, 69, 0, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark solar spots
  for (let i = 0; i < 8; i++) {
    const x = (0.2 + Math.random() * 0.6) * size;
    const y = (0.3 + Math.random() * 0.4) * size;
    const r = 4 + Math.random() * 12;
    const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
    spotGrad.addColorStop(0, 'rgba(40, 10, 0, 0.85)');
    spotGrad.addColorStop(0.5, 'rgba(120, 25, 0, 0.4)');
    spotGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Earth procedural texture (oceans, continents, green/brown vegetation)
export function createEarthTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const { canvas, ctx } = createCanvas(width, height);

  // Ocean base
  ctx.fillStyle = '#103960';
  ctx.fillRect(0, 0, width, height);

  // Shallow coastal waters
  ctx.fillStyle = '#1D6399';
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.arc(x, y, 40 + Math.random() * 60, 0, Math.PI * 2);
    ctx.fill();
  }

  // Land masses (Continents)
  ctx.fillStyle = '#2D6A4F';
  for (let i = 0; i < 35; i++) {
    const cx = Math.random() * width;
    const cy = 0.2 * height + Math.random() * 0.6 * height;
    ctx.beginPath();
    const points = 12;
    for (let p = 0; p < points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const dist = 30 + Math.random() * 70;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * (dist * 0.7);
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Arid / Mountain highlights on land
  ctx.fillStyle = '#9C6644';
  for (let i = 0; i < 25; i++) {
    const cx = Math.random() * width;
    const cy = 0.25 * height + Math.random() * 0.5 * height;
    ctx.beginPath();
    ctx.arc(cx, cy, 15 + Math.random() * 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polar Ice Caps
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, width, 40);
  ctx.fillRect(0, height - 40, width, 40);
  for (let x = 0; x < width; x += 15) {
    ctx.beginPath();
    ctx.arc(x, 40 + Math.random() * 15, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, height - 40 - Math.random() * 15, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Earth clouds layer texture (semi-transparent white swirls)
export function createEarthCloudTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const { canvas, ctx } = createCanvas(width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';

  for (let i = 0; i < 70; i++) {
    const x = Math.random() * width;
    const y = 0.15 * height + Math.random() * 0.7 * height;
    const rx = 40 + Math.random() * 100;
    const ry = 10 + Math.random() * 30;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Gas Giant banded texture (e.g. Jupiter, Saturn)
export function createGasGiantTexture(colorA: string, colorB: string, hasRedSpot = false): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const { canvas, ctx } = createCanvas(width, height);

  // Base background
  ctx.fillStyle = colorA;
  ctx.fillRect(0, 0, width, height);

  // Banded horizontal stripes
  const numBands = 45;
  for (let b = 0; b < numBands; b++) {
    const y = (b / numBands) * height;
    const bandHeight = height / numBands + 2;
    const t = Math.sin(b * 0.7);
    const alpha = 0.35 + Math.abs(t) * 0.55;

    ctx.fillStyle = b % 2 === 0 ? colorB : colorA;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, y, width, bandHeight);

    // Turbulence / vortices along the bands
    ctx.globalAlpha = 0.25;
    for (let v = 0; v < 6; v++) {
      const vx = Math.random() * width;
      const vr = 10 + Math.random() * 35;
      ctx.beginPath();
      ctx.ellipse(vx, y + bandHeight / 2, vr * 2, vr, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1.0;

  // Great Red Spot (if requested for Jupiter)
  if (hasRedSpot) {
    const spotX = width * 0.65;
    const spotY = height * 0.62;
    const spotGrad = ctx.createRadialGradient(spotX, spotY, 5, spotX, spotY, 65);
    spotGrad.addColorStop(0, '#B91C1C');
    spotGrad.addColorStop(0.6, '#DC2626');
    spotGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, 75, 45, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Swirl ring inside spot
    ctx.strokeStyle = '#FECACA';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, 40, 22, -0.1, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Ice Giant texture (Uranus, Neptune)
export function createIceGiantTexture(primaryColor: string, secondaryColor: string): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const { canvas, ctx } = createCanvas(width, height);

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, primaryColor);
  grad.addColorStop(0.3, secondaryColor);
  grad.addColorStop(0.5, primaryColor);
  grad.addColorStop(0.7, secondaryColor);
  grad.addColorStop(1, primaryColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle fast atmospheric wind streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * height;
    const h = 4 + Math.random() * 12;
    ctx.fillRect(0, y, width, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Rocky / Cratered texture (Mercury, Moon, Mars, rocky custom planets)
export function createRockyTexture(primaryColor: string, secondaryColor: string, hasPolarCaps = false): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const { canvas, ctx } = createCanvas(width, height);

  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, width, height);

  // Noise patches
  for (let i = 0; i < 250; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 10 + Math.random() * 45;
    ctx.fillStyle = Math.random() > 0.5 ? secondaryColor : 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters with shadows and bright rims
  for (let c = 0; c < 120; c++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const cr = 4 + Math.random() * 18;

    // Dark crater bowl
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    // Highlighted rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx + 1, cy - 1, cr, 0, Math.PI * 1.2);
    ctx.stroke();
  }

  // Polar ice caps if requested (e.g. Mars)
  if (hasPolarCaps) {
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.ellipse(width / 2, 0, width / 2, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width / 2, height, width / 2, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Fictional / Exotic Alien Planet texture (glowing veins, crystal plates, bioluminescent swirls)
export function createFictionalTexture(primaryColor: string, secondaryColor: string): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const { canvas, ctx } = createCanvas(width, height);

  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, width, height);

  // Swirling exotic vortex patterns
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 30 + Math.random() * 90;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, secondaryColor);
    grad.addColorStop(0.7, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bioluminescent vein streaks
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.45;
  for (let v = 0; v < 15; v++) {
    ctx.beginPath();
    let cx = Math.random() * width;
    let cy = Math.random() * height;
    ctx.moveTo(cx, cy);
    for (let step = 0; step < 8; step++) {
      cx += (Math.random() - 0.5) * 80;
      cy += (Math.random() - 0.5) * 40;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Rings Texture (concentric alpha bands for Saturn or custom ringed planets)
export function createRingTexture(ringColor: string): THREE.CanvasTexture {
  const width = 512;
  const height = 64;
  const { canvas, ctx } = createCanvas(width, height);

  ctx.clearRect(0, 0, width, height);

  // Draw concentric density bands across width
  for (let x = 0; x < width; x++) {
    const pos = x / width;
    // Cassini division / rings gaps
    if ((pos > 0.62 && pos < 0.67) || (pos > 0.15 && pos < 0.18)) {
      continue;
    }
    const noise = Math.sin(pos * 50) * 0.3 + Math.cos(pos * 120) * 0.2;
    const alpha = Math.max(0.08, Math.min(0.9, 0.45 + noise + (pos > 0.3 && pos < 0.8 ? 0.3 : 0)));

    ctx.fillStyle = ringColor;
    ctx.globalAlpha = alpha;
    ctx.fillRect(x, 0, 1, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural Star glow sprite texture (used for realistic emissive coronas around stars)
export function createStarGlowTexture(color: string): THREE.CanvasTexture {
  const size = 256;
  const { canvas, ctx } = createCanvas(size, size);
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.2, color);
  grad.addColorStop(0.5, 'rgba(255, 180, 50, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Master texture picker for any celestial body
export function getPlanetTexture(body: CelestialBody): THREE.CanvasTexture {
  const colorB = body.secondaryColor || '#222222';

  if (body.id === 'earth') {
    return createEarthTexture();
  }
  if (body.id === 'jupiter') {
    return createGasGiantTexture(body.color, colorB, true);
  }
  if (body.id === 'mars') {
    return createRockyTexture(body.color, colorB, true);
  }
  if (body.type === 'gas_giant') {
    return createGasGiantTexture(body.color, colorB, false);
  }
  if (body.type === 'ice_giant') {
    return createIceGiantTexture(body.color, colorB);
  }
  if (body.type === 'rocky' || body.type === 'moon') {
    return createRockyTexture(body.color, colorB, false);
  }
  if (body.type === 'fictional') {
    return createFictionalTexture(body.color, colorB);
  }
  return createRockyTexture(body.color, colorB, false);
}
