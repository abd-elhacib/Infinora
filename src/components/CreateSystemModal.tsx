/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, AlertCircle, Sun, Orbit } from 'lucide-react';
import { StarSystem, StarSpectralType, Language, CelestialBody } from '../types/space';
import { TRANSLATIONS } from '../data/translations';

interface CreateSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (system: StarSystem) => void;
  language: Language;
}

const STAR_TYPES: {
  type: StarSpectralType;
  nameKey: string;
  defaultColor: string;
  defaultEmissive: string;
  temp: number;
}[] = [
  {
    type: 'yellow_dwarf',
    nameKey: 'starYellowDwarf',
    defaultColor: '#FDB813',
    defaultEmissive: '#FF8C00',
    temp: 5778,
  },
  {
    type: 'red_giant',
    nameKey: 'starRedGiant',
    defaultColor: '#FF5722',
    defaultEmissive: '#B71C1C',
    temp: 3400,
  },
  {
    type: 'blue_supergiant',
    nameKey: 'starBlueSupergiant',
    defaultColor: '#00D2FF',
    defaultEmissive: '#0066FF',
    temp: 21000,
  },
  {
    type: 'white_dwarf',
    nameKey: 'starWhiteDwarf',
    defaultColor: '#F0F8FF',
    defaultEmissive: '#80D8FF',
    temp: 12000,
  },
  {
    type: 'neutron_star',
    nameKey: 'starNeutronStar',
    defaultColor: '#E040FB',
    defaultEmissive: '#7C4DFF',
    temp: 1000000,
  },
];

export const CreateSystemModal: React.FC<CreateSystemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const [systemName, setSystemName] = useState('New Star System');
  const [starName, setStarName] = useState('Alpha Core');
  const [spectralType, setSpectralType] = useState<StarSpectralType>('yellow_dwarf');
  const [starColor, setStarColor] = useState('#FDB813');
  const [starSize, setStarSize] = useState<number>(5.5);
  const [initialPlanetsCount, setInitialPlanetsCount] = useState<number>(3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpectralSelect = (item: (typeof STAR_TYPES)[0]) => {
    setSpectralType(item.type);
    setStarColor(item.defaultColor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!systemName.trim() || systemName.trim().length < 2) {
      setErrorMsg(t.nameRequired);
      return;
    }
    if (!starName.trim() || starName.trim().length < 2) {
      setErrorMsg(t.nameRequired);
      return;
    }

    const typeObj = STAR_TYPES.find((s) => s.type === spectralType) || STAR_TYPES[0];
    const systemId = `custom-system-${Date.now()}`;

    // Generate starter planets for immediate delight
    const planets: CelestialBody[] = [];
    const planetColors = ['#2A9D8F', '#E76F51', '#4CC9F0', '#E63946', '#9B5DE5'];
    const planetTypes: ('rocky' | 'gas_giant' | 'ice_giant')[] = ['rocky', 'gas_giant', 'ice_giant'];

    let dist = 16;
    for (let i = 0; i < initialPlanetsCount; i++) {
      const pType = planetTypes[i % planetTypes.length];
      const pColor = planetColors[i % planetColors.length];
      const pSize = Number((0.9 + i * 0.5).toFixed(1));
      dist += 14 + i * 4;

      planets.push({
        id: `p-${Date.now()}-${i}`,
        name: `${starName} ${String.fromCharCode(98 + i)}`,
        type: pType,
        color: pColor,
        secondaryColor: '#1E293B',
        size: pSize,
        distance: dist,
        speed: Number((1.2 - i * 0.25).toFixed(2)),
        rotationSpeed: 0.015,
        hasRings: i === 1, // Add rings to second planet
        ringInnerRadius: i === 1 ? pSize * 1.3 : undefined,
        ringOuterRadius: i === 1 ? pSize * 2.3 : undefined,
        ringColor: i === 1 ? '#D8C29D' : undefined,
        moons: [
          {
            id: `moon-${i}-1`,
            name: `${starName} ${String.fromCharCode(98 + i)} Minor`,
            size: 0.2,
            distance: pSize + 1.2,
            speed: 2.5,
            color: '#CBD5E1',
          },
        ],
        isUserCreated: true,
        descriptionEn: `An initial celestial body orbiting the newly created ${systemName}.`,
        descriptionAr: `جرم كوكبي أولي يدور في نظام ${systemName} المنشأ حديثاً.`,
      });
    }

    const newSystem: StarSystem = {
      id: systemId,
      name: systemName.trim(),
      isRealSolarSystem: false,
      isUserCreated: true,
      createdAt: Date.now(),
      scaleNoteEn: 'Custom user-created universe star system.',
      scaleNoteAr: 'نظام نجمي مخصص من إنشاء المستخدم.',
      star: {
        name: starName.trim(),
        spectralType,
        color: starColor,
        emissiveColor: typeObj.defaultEmissive,
        size: starSize,
        luminosity: 1.0,
        surfaceTempK: typeObj.temp,
        descriptionEn: `Central stellar furnace anchoring the orbits of the ${systemName}.`,
        descriptionAr: `النجم المركزي الذي ترتكز عليه مدارات نظام ${systemName}.`,
      },
      planets,
    };

    onSubmit(newSystem);
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
            <Orbit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">{t.createUniverse}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Universe / System Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.systemName} *
            </label>
            <input
              type="text"
              required
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="e.g. Andromeda Outpost 7"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Central Star Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.starName} *
            </label>
            <input
              type="text"
              required
              value={starName}
              onChange={(e) => setStarName(e.target.value)}
              placeholder="e.g. Solaris Prime"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Star Spectral Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.starType}
            </label>
            <div className="space-y-1.5">
              {STAR_TYPES.map((st) => (
                <button
                  key={st.type}
                  type="button"
                  onClick={() => handleSpectralSelect(st)}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    spectralType === st.type
                      ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: st.defaultColor }}
                    />
                    <span className="text-xs font-medium">
                      {t[st.nameKey as keyof typeof t] || st.type}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{st.temp} K</span>
                </button>
              ))}
            </div>
          </div>

          {/* Star Custom Color & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.starColor}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={starColor}
                  onChange={(e) => setStarColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-300 uppercase">{starColor}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">{t.starSize}</label>
                <span className="text-xs font-mono text-indigo-400 tabular-nums">
                  {starSize.toFixed(1)} units
                </span>
              </div>
              <input
                type="range"
                min="3.0"
                max="8.0"
                step="0.5"
                value={starSize}
                onChange={(e) => setStarSize(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 accent-indigo-500 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Initial Starter Planets */}
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Initial Orbiting Planets
              </label>
              <span className="text-xs font-mono text-indigo-400 tabular-nums">
                {initialPlanetsCount} planets
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={initialPlanetsCount}
              onChange={(e) => setInitialPlanetsCount(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 accent-indigo-500 rounded-lg cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              You can add and customize more planets anytime with the &quot;Create Planet&quot; tool.
            </div>
          </div>

          {/* Submit */}
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{t.create}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
