/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlanetType = 'rocky' | 'gas_giant' | 'ice_giant' | 'fictional' | 'star' | 'moon';

export type StarSpectralType = 'yellow_dwarf' | 'red_giant' | 'blue_supergiant' | 'white_dwarf' | 'neutron_star';

export interface MoonData {
  id: string;
  name: string;
  size: number; // visual scale
  distance: number; // distance from parent planet
  speed: number;
  color: string;
}

export interface CelestialBody {
  id: string;
  name: string;
  type: PlanetType;
  color: string;
  secondaryColor?: string;
  size: number; // radius in 3D units
  distance: number; // distance from center star
  speed: number; // orbital speed multiplier
  rotationSpeed?: number; // self-rotation speed
  eccentricity?: number;
  inclination?: number;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringColor?: string;
  moons?: MoonData[];
  isUserCreated?: boolean;
  
  // Educational & Scientific Information
  realDiameterKm?: number | string;
  realDistanceAU?: number | string;
  orbitalPeriodDays?: number | string;
  dayLengthHours?: number | string;
  surfaceTempC?: number | string;
  atmosphere?: string;
  descriptionEn: string;
  descriptionAr: string;
  funFactEn?: string;
  funFactAr?: string;
}

export interface StarData {
  name: string;
  spectralType: StarSpectralType;
  color: string;
  emissiveColor: string;
  size: number;
  luminosity: number;
  descriptionEn: string;
  descriptionAr: string;
  surfaceTempK: number;
}

export interface StarSystem {
  id: string;
  name: string;
  isRealSolarSystem?: boolean;
  isUserCreated?: boolean;
  createdAt: number;
  star: StarData;
  planets: CelestialBody[];
  scaleNoteEn?: string;
  scaleNoteAr?: string;
}

export type Language = 'en' | 'ar';
