/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sun,
  Eye,
  Orbit,
  FastForward,
} from 'lucide-react';
import { Language } from '../types/space';
import { TRANSLATIONS } from '../data/translations';

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  onResetCamera: () => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onFocusStar: () => void;
  language: Language;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  simulationSpeed,
  onSpeedChange,
  onResetCamera,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  onFocusStar,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-25 max-w-full px-3">
      <div className="flex items-center gap-2 md:gap-3 px-3 py-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-2xl text-slate-200">
        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
            isPlaying
              ? 'bg-sky-600/90 text-white hover:bg-sky-500'
              : 'bg-amber-600/90 text-white hover:bg-amber-500'
          }`}
          title={isPlaying ? t.pause : t.play}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 px-1 border-x border-slate-800">
          <FastForward className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
          <span className="text-[11px] font-mono text-slate-300 w-10 text-right tabular-nums">
            {simulationSpeed.toFixed(1)}x
          </span>
          <input
            type="range"
            min="0.1"
            max="6.0"
            step="0.1"
            value={simulationSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-16 sm:w-24 h-1.5 bg-slate-800 accent-sky-500 rounded-lg cursor-pointer"
            title={`${t.speed}: ${simulationSpeed.toFixed(1)}x`}
          />
        </div>

        {/* Toggle Orbits */}
        <button
          onClick={onToggleOrbits}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            showOrbits
              ? 'bg-slate-800 text-sky-400 border border-sky-800/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
          title={t.toggleOrbits}
        >
          <Orbit className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.toggleOrbits}</span>
        </button>

        {/* Toggle Labels */}
        <button
          onClick={onToggleLabels}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            showLabels
              ? 'bg-slate-800 text-sky-400 border border-sky-800/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
          title={t.toggleLabels}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.toggleLabels}</span>
        </button>

        {/* Focus Star */}
        <button
          onClick={onFocusStar}
          className="p-2 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
          title={t.focusStar}
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Reset Camera */}
        <button
          onClick={onResetCamera}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title={t.resetCamera}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
