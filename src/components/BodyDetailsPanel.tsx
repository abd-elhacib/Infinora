/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Compass,
  LocateFixed,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Thermometer,
  Clock,
  Compass as OrbitIcon,
  CircleDot,
} from 'lucide-react';
import { CelestialBody, StarData, Language } from '../types/space';
import { TRANSLATIONS } from '../data/translations';

interface BodyDetailsPanelProps {
  body: CelestialBody | 'star' | null;
  star: StarData;
  language: Language;
  onClose: () => void;
  onFocus: () => void;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onEditPlanet?: (planet: CelestialBody) => void;
  onDeletePlanet?: (planetId: string) => void;
}

export const BodyDetailsPanel: React.FC<BodyDetailsPanelProps> = ({
  body,
  star,
  language,
  onClose,
  onFocus,
  isFollowing,
  onToggleFollow,
  onEditPlanet,
  onDeletePlanet,
}) => {
  const t = TRANSLATIONS[language];

  if (!body) return null;

  const isStar = body === 'star';
  const name = isStar ? star.name : body.name;
  const description = isStar
    ? language === 'ar'
      ? star.descriptionAr
      : star.descriptionEn
    : language === 'ar'
    ? body.descriptionAr
    : body.descriptionEn;

  const funFact = !isStar
    ? language === 'ar'
      ? body.funFactAr
      : body.funFactEn
    : undefined;

  const color = isStar ? star.color : body.color;

  return (
    <div
      className={`fixed top-20 ${
        language === 'ar' ? 'left-4 right-auto' : 'right-4 left-auto'
      } w-88 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-7rem)] overflow-y-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl z-25 text-slate-200 p-5 space-y-4`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-5 h-5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white truncate">{name}</h2>
            <div className="text-[11px] text-sky-400 capitalize">
              {isStar
                ? star.spectralType.replace('_', ' ')
                : t[`type${body.type.charAt(0).toUpperCase() + body.type.slice(1).replace('_', '')}` as keyof typeof t] ||
                  body.type.replace('_', ' ')}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close inspector"
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons: Focus, Follow Orbit, Edit, Delete */}
      <div className="flex items-center gap-2">
        <button
          onClick={onFocus}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{t.focusBody}</span>
        </button>

        {!isStar && (
          <button
            onClick={onToggleFollow}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isFollowing
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{isFollowing ? t.following : t.followPlanet}</span>
          </button>
        )}
      </div>

      {/* User planet management actions */}
      {!isStar && body.isUserCreated && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
          {onEditPlanet && (
            <button
              onClick={() => onEditPlanet(body)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-3 h-3 text-sky-400" />
              <span>{t.editPlanet}</span>
            </button>
          )}

          {onDeletePlanet && (
            <button
              onClick={() => onDeletePlanet(body.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>{t.deletePlanet}</span>
            </button>
          )}
        </div>
      )}

      {/* Primary Description */}
      <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
        {description}
      </div>

      {/* Scientific Metrics Grid */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {t.stats}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Diameter */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <CircleDot className="w-3 h-3 text-sky-400" />
              <span>{t.diameter}</span>
            </div>
            <div className="font-mono text-slate-100 font-medium tabular-nums">
              {isStar
                ? `${Math.round(star.size * 250000).toLocaleString()} km`
                : body.realDiameterKm || `${Math.round(body.size * 12000).toLocaleString()} km`}
            </div>
          </div>

          {/* Distance from Star */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <OrbitIcon className="w-3 h-3 text-indigo-400" />
              <span>{t.distanceFromStar}</span>
            </div>
            <div className="font-mono text-slate-100 font-medium tabular-nums">
              {isStar ? 'Center' : body.realDistanceAU || `${body.distance} Units`}
            </div>
          </div>

          {/* Orbital Period */}
          {!isStar && (
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{t.orbitalPeriod}</span>
              </div>
              <div className="font-mono text-slate-100 font-medium tabular-nums">
                {body.orbitalPeriodDays || `${Math.round(body.distance * 14)} days`}
              </div>
            </div>
          )}

          {/* Surface Temperature */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Thermometer className="w-3 h-3 text-amber-400" />
              <span>{t.surfaceTemp}</span>
            </div>
            <div className="font-mono text-slate-100 font-medium tabular-nums">
              {isStar ? `${star.surfaceTempK} K` : body.surfaceTempC || '-'}
            </div>
          </div>

          {/* Moons */}
          {!isStar && (
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                <CircleDot className="w-3 h-3 text-purple-400" />
                <span>{t.moonsCount}</span>
              </div>
              <div className="font-mono text-slate-100 font-medium tabular-nums">
                {body.moons ? body.moons.length : 0}
              </div>
            </div>
          )}

          {/* Rings */}
          {!isStar && (
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                <Layers className="w-3 h-3 text-teal-400" />
                <span>{t.hasRings}</span>
              </div>
              <div className="text-slate-100 font-medium">
                {body.hasRings ? t.yes : t.no}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Atmosphere if available */}
      {!isStar && body.atmosphere && (
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 text-xs">
          <div className="text-[11px] text-slate-400 font-medium mb-1">{t.atmosphere}</div>
          <div className="text-slate-200">{body.atmosphere}</div>
        </div>
      )}

      {/* Natural Satellites List */}
      {!isStar && body.moons && body.moons.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t.moonsCount} ({body.moons.length})
          </div>
          <div className="space-y-1">
            {body.moons.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-900/40 rounded-lg border border-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span>{m.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  r: {m.distance}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fun Astronomical Fact */}
      {funFact && (
        <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.funFact}</span>
          </div>
          <p className="text-amber-200/90 leading-relaxed">{funFact}</p>
        </div>
      )}
    </div>
  );
};
