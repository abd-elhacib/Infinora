/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { CelestialBody, PlanetType, Language, MoonData } from '../types/space';
import { TRANSLATIONS } from '../data/translations';

interface CreatePlanetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planetData: Partial<CelestialBody>) => void;
  existingPlanets: CelestialBody[];
  editingPlanet?: CelestialBody | null;
  language: Language;
}

const PRESET_COLORS: { label: string; hex: string; type: PlanetType }[] = [
  { label: 'Rust Terrestrial', hex: '#C1440E', type: 'rocky' },
  { label: 'Obsidian Basalt', hex: '#64748B', type: 'rocky' },
  { label: 'Golden Gas', hex: '#E2BF7D', type: 'gas_giant' },
  { label: 'Banded Amber', hex: '#C88B3A', type: 'gas_giant' },
  { label: 'Cyan Ice', hex: '#70D6FF', type: 'ice_giant' },
  { label: 'Deep Azure', hex: '#2774AE', type: 'ice_giant' },
  { label: 'Exotic Violet', hex: '#A855F7', type: 'fictional' },
  { label: 'Bioluminescent Emerald', hex: '#10B981', type: 'fictional' },
];

export const CreatePlanetModal: React.FC<CreatePlanetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingPlanets,
  editingPlanet,
  language,
}) => {
  const t = TRANSLATIONS[language];

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<PlanetType>('rocky');
  const [color, setColor] = useState('#2A9D8F');
  const [secondaryColor, setSecondaryColor] = useState('#264653');
  const [size, setSize] = useState<number>(1.2);
  const [distance, setDistance] = useState<number>(30);
  const [speed, setSpeed] = useState<number>(1.0);
  const [hasRings, setHasRings] = useState<boolean>(false);
  const [ringColor, setRingColor] = useState<string>('#CBD5E1');
  const [numMoons, setNumMoons] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form on open or when editingPlanet changes
  useEffect(() => {
    if (editingPlanet) {
      setName(editingPlanet.name);
      setType(editingPlanet.type);
      setColor(editingPlanet.color);
      setSecondaryColor(editingPlanet.secondaryColor || '#222222');
      setSize(editingPlanet.size);
      setDistance(editingPlanet.distance);
      setSpeed(editingPlanet.speed);
      setHasRings(!!editingPlanet.hasRings);
      setRingColor(editingPlanet.ringColor || editingPlanet.color);
      setNumMoons(editingPlanet.moons ? editingPlanet.moons.length : 0);
      setErrorMsg(null);
    } else {
      // Suggest safe new distance outside largest existing planet or between
      const maxDist = existingPlanets.reduce((max, p) => Math.max(max, p.distance), 15);
      const suggestedDist = Number((maxDist + 12).toFixed(1));

      setName(`Planet-${Math.floor(Math.random() * 900 + 100)}`);
      setType('rocky');
      setColor('#2A9D8F');
      setSecondaryColor('#264653');
      setSize(1.3);
      setDistance(Math.min(180, suggestedDist));
      setSpeed(0.8);
      setHasRings(false);
      setRingColor('#CBD5E1');
      setNumMoons(1);
      setErrorMsg(null);
    }
  }, [editingPlanet, isOpen, existingPlanets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg(t.nameRequired);
      return;
    }

    // Check distance collisions with other planets (within 1.5 units)
    const collision = existingPlanets.find(
      (p) => (!editingPlanet || p.id !== editingPlanet.id) && Math.abs(p.distance - distance) < 2.0
    );
    if (collision) {
      setErrorMsg(`${t.distanceConflict} (${collision.name} is at ${collision.distance})`);
      return;
    }

    // Generate moons array
    const moons: MoonData[] = [];
    for (let i = 0; i < numMoons; i++) {
      moons.push({
        id: `moon-${Date.now()}-${i}`,
        name: `${name} ${['I', 'II', 'III', 'IV', 'V'][i]}`,
        size: Number((size * 0.18).toFixed(2)),
        distance: Number((size + 1.2 + i * 0.8).toFixed(1)),
        speed: Number((1.8 + i * 0.6).toFixed(1)),
        color: ['#D1D5DB', '#CBD5E1', '#E2E8F0', '#94A3B8', '#F1F5F9'][i % 5],
      });
    }

    const payload: Partial<CelestialBody> = {
      name: name.trim(),
      type,
      color,
      secondaryColor,
      size,
      distance,
      speed,
      rotationSpeed: 0.015,
      hasRings,
      ringInnerRadius: hasRings ? Number((size * 1.35).toFixed(2)) : undefined,
      ringOuterRadius: hasRings ? Number((size * 2.3).toFixed(2)) : undefined,
      ringColor: hasRings ? ringColor : undefined,
      moons,
      isUserCreated: true,
      descriptionEn: `A custom user-configured ${type.replace('_', ' ')} planet engineered with ${numMoons} orbital satellites.`,
      descriptionAr: `كوكب مخصص من تصميم المستخدم من نوع ${type} يدور حوله ${numMoons} قمر تابع.`,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              {editingPlanet ? t.editPlanet : t.createPlanet}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Planet Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.planetName} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zephyrus Prime"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Planet Archetype */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.planetType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'rocky', label: t.typeRocky },
                  { id: 'gas_giant', label: t.typeGasGiant },
                  { id: 'ice_giant', label: t.typeIceGiant },
                  { id: 'fictional', label: t.typeFictional },
                ] as const
              ).map((archetype) => (
                <button
                  key={archetype.id}
                  type="button"
                  onClick={() => setType(archetype.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    type === archetype.id
                      ? 'bg-sky-950/60 border-sky-500 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {archetype.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Palette Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.planetColor}
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer p-0.5"
              />
              <span className="font-mono text-xs text-slate-300 uppercase">{color}</span>
            </div>

            {/* Curated Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => {
                    setColor(preset.hex);
                    setType(preset.type);
                  }}
                  className="w-6 h-6 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: preset.hex }}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          {/* Size & Distance Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Size */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">{t.planetSize}</label>
                <span className="text-xs font-mono text-sky-400 tabular-nums">
                  {size.toFixed(1)} units
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={size}
                onChange={(e) => setSize(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 accent-sky-500 rounded-lg cursor-pointer"
              />
            </div>

            {/* Distance */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">{t.orbitalDistance}</label>
                <span className="text-xs font-mono text-sky-400 tabular-nums">
                  {distance.toFixed(0)} units
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="160"
                step="1"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 accent-sky-500 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Speed & Moons Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Orbital Speed */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">{t.orbitalSpeed}</label>
                <span className="text-xs font-mono text-sky-400 tabular-nums">
                  {speed.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 accent-sky-500 rounded-lg cursor-pointer"
              />
            </div>

            {/* Number of Moons */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">{t.numberOfMoons}</label>
                <span className="text-xs font-mono text-sky-400 tabular-nums">{numMoons}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={numMoons}
                onChange={(e) => setNumMoons(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 accent-sky-500 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Rings Toggle */}
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-200">{t.ringsToggle}</div>
              <div className="text-[11px] text-slate-400">
                Generate concentric dust/ice ring disk
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasRings}
                onChange={(e) => setHasRings(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Ring Color if enabled */}
          {hasRings && (
            <div className="flex items-center gap-3 pl-2">
              <input
                type="color"
                value={ringColor}
                onChange={(e) => setRingColor(e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer p-0.5"
              />
              <span className="text-xs text-slate-300">Ring Color Palette</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{editingPlanet ? t.save : t.create}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
