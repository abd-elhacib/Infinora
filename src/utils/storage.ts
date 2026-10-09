/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StarSystem, CelestialBody } from '../types/space';
import { REAL_SOLAR_SYSTEM } from '../data/solarSystem';

const STORAGE_KEY = 'cosmos_saved_star_systems_v1';
const ACTIVE_SYSTEM_KEY = 'cosmos_active_system_id_v1';

export function loadSavedSystems(): StarSystem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [REAL_SOLAR_SYSTEM];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [REAL_SOLAR_SYSTEM];
    }

    // Always ensure canonical Real Solar System is present and pristine at position 0
    const filtered = parsed.filter((s: StarSystem) => s.id !== REAL_SOLAR_SYSTEM.id);
    return [REAL_SOLAR_SYSTEM, ...filtered];
  } catch (err) {
    console.error('Failed to load saved systems from localStorage:', err);
    return [REAL_SOLAR_SYSTEM];
  }
}

export function saveSystems(systems: StarSystem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
  } catch (err) {
    console.error('Failed to persist systems to localStorage:', err);
  }
}

export function getActiveSystemId(): string {
  try {
    return localStorage.getItem(ACTIVE_SYSTEM_KEY) || REAL_SOLAR_SYSTEM.id;
  } catch {
    return REAL_SOLAR_SYSTEM.id;
  }
}

export function setActiveSystemId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SYSTEM_KEY, id);
  } catch (err) {
    console.error('Failed to save active system ID:', err);
  }
}

// Generate random star system
const RANDOM_STAR_NAMES = [
  'Kepler-452', 'Trappist-1', 'Gliese 667', 'Proxima Centauri', 
  'Epsilon Eridani', 'Vega Major', 'Aldebaran Nova', 'Sirius Outpost', 
  'Tau Ceti', 'HD 189733', 'Polaris Prime', 'Antares Sector',
  'Altair Verge', 'Rigel Reach', 'Canopus Core'
];

const RANDOM_PLANET_NAMES = [
  'Aethel', 'Boreas', 'Chronos', 'Daedalus', 'Elysium', 
  'Faye', 'Gorgon', 'Hyperion', 'Ignis', 'Juno', 
  'Kallisto', 'Lyra', 'Morpheus', 'Nix', 'Orion', 
  'Pax', 'Quasar', 'Rhea', 'Styx', 'Thalassa', 
  'Umbriel', 'Vesper', 'Zephyr', 'Aurelia', 'Tartarus'
];

const STAR_SPECTRAL_TYPES = [
  {
    type: 'yellow_dwarf' as const,
    color: '#FDB813',
    emissive: '#FF8C00',
    name: 'Yellow Dwarf',
    temp: 5778,
  },
  {
    type: 'red_giant' as const,
    color: '#FF5722',
    emissive: '#B71C1C',
    name: 'Red Giant',
    temp: 3400,
  },
  {
    type: 'blue_supergiant' as const,
    color: '#00D2FF',
    emissive: '#0066FF',
    name: 'Blue Supergiant',
    temp: 21000,
  },
  {
    type: 'white_dwarf' as const,
    color: '#F0F8FF',
    emissive: '#80D8FF',
    name: 'White Dwarf',
    temp: 12000,
  },
  {
    type: 'neutron_star' as const,
    color: '#E040FB',
    emissive: '#7C4DFF',
    name: 'Pulsar / Neutron Star',
    temp: 1000000,
  },
];

const PLANET_PALETTES = [
  { pri: '#E63946', sec: '#457B9D', type: 'rocky' as const },
  { pri: '#2A9D8F', sec: '#264653', type: 'rocky' as const },
  { pri: '#E76F51', sec: '#F4A261', type: 'gas_giant' as const },
  { pri: '#7209B7', sec: '#3A0CA3', type: 'gas_giant' as const },
  { pri: '#4CC9F0', sec: '#4361EE', type: 'ice_giant' as const },
  { pri: '#06D6A0', sec: '#118AB2', type: 'ice_giant' as const },
  { pri: '#FF006E', sec: '#8338EC', type: 'fictional' as const },
  { pri: '#FB5607', sec: '#FFBE0B', type: 'fictional' as const },
];

export function generateRandomStarSystem(): StarSystem {
  const baseName = RANDOM_STAR_NAMES[Math.floor(Math.random() * RANDOM_STAR_NAMES.length)];
  const systemId = `system-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const starInfo = STAR_SPECTRAL_TYPES[Math.floor(Math.random() * STAR_SPECTRAL_TYPES.length)];
  const numPlanets = 3 + Math.floor(Math.random() * 5); // 3 to 7 planets

  const planets: CelestialBody[] = [];
  let currentDistance = 14 + Math.random() * 4;

  const usedNames = new Set<string>();

  for (let i = 0; i < numPlanets; i++) {
    let pName = RANDOM_PLANET_NAMES[Math.floor(Math.random() * RANDOM_PLANET_NAMES.length)];
    while (usedNames.has(pName)) {
      pName = `${pName} ${String.fromCharCode(65 + i)}`;
    }
    usedNames.add(pName);

    const palette = PLANET_PALETTES[Math.floor(Math.random() * PLANET_PALETTES.length)];
    const size = Number((0.7 + Math.random() * 2.4).toFixed(2));
    const speed = Number((0.25 + Math.random() * 1.4).toFixed(2));
    const hasRings = Math.random() > 0.65;
    const numMoons = Math.floor(Math.random() * 4); // 0 to 3 moons

    const moons = [];
    for (let m = 0; m < numMoons; m++) {
      moons.push({
        id: `moon-${m}-${Date.now()}`,
        name: `${pName} Moon ${m + 1}`,
        size: Number((0.15 + Math.random() * 0.22).toFixed(2)),
        distance: Number((size + 1.2 + m * 0.8).toFixed(1)),
        speed: Number((1.8 + Math.random() * 2.2).toFixed(1)),
        color: ['#D1D5DB', '#94A3B8', '#FDE047', '#CBD5E1', '#E2E8F0'][m % 5],
      });
    }

    currentDistance += 10 + Math.random() * 12;

    planets.push({
      id: `p-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
      name: pName,
      type: palette.type,
      color: palette.pri,
      secondaryColor: palette.sec,
      size,
      distance: Number(currentDistance.toFixed(1)),
      speed,
      rotationSpeed: Number((0.01 + Math.random() * 0.02).toFixed(3)),
      hasRings,
      ringInnerRadius: hasRings ? Number((size * 1.3).toFixed(2)) : undefined,
      ringOuterRadius: hasRings ? Number((size * 2.2).toFixed(2)) : undefined,
      ringColor: hasRings ? palette.sec : undefined,
      moons,
      isUserCreated: true,
      descriptionEn: `A ${palette.type.replace('_', ' ')} world orbiting within the ${baseName} system, exhibiting unique geological formations and atmospheric characteristics.`,
      descriptionAr: `كوكب من نوع ${palette.type} يدور في نظام ${baseName}، يتميز بتشكيلات جيولوجية وخصائص جوية فريدة.`,
      funFactEn: `Orbital period estimates indicate high resonance with neighbouring celestial bodies in the system.`,
      funFactAr: `تشير تقديرات فترته المدارية إلى رنين جاذبي عالي مع الأجرام المجاورة في النظام.`,
      realDiameterKm: `${Math.round(size * 12000)} km`,
      orbitalPeriodDays: `${Math.round(currentDistance * 12)} days`,
      surfaceTempC: `${Math.round(-150 + (100 / Math.sqrt(currentDistance)) * 25)}°C`,
    });
  }

  return {
    id: systemId,
    name: `${baseName} System`,
    isRealSolarSystem: false,
    isUserCreated: true,
    createdAt: Date.now(),
    scaleNoteEn: 'Procedurally generated star system. Distances and sizes are calibrated for interactive 3D navigation.',
    scaleNoteAr: 'نظام نجمي تم إنشاؤه إجرائياً. تم ضبط المسافات والأحجام لتسهيل الملاحة ثلاثية الأبعاد.',
    star: {
      name: `${baseName} Core`,
      spectralType: starInfo.type,
      color: starInfo.color,
      emissiveColor: starInfo.emissive,
      size: Number((4.5 + Math.random() * 2.5).toFixed(1)),
      luminosity: 1.0,
      surfaceTempK: starInfo.temp,
      descriptionEn: `A central ${starInfo.name} radiating intense stellar wind and light across its planetary disk.`,
      descriptionAr: `نجم مركزي من نوع ${starInfo.name} يشع رياحاً نجمية قوية ونوراً يغمر قرصه الكوكبي.`,
    },
    planets,
  };
}
