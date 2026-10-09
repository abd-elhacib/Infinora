/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Globe,
  PlusCircle,
  Sparkles,
  Trash2,
  Edit2,
  HardDrive,
  Info,
  ChevronRight,
} from 'lucide-react';
import { StarSystem, Language } from '../types/space';
import { TRANSLATIONS } from '../data/translations';

interface SidebarProps {
  systems: StarSystem[];
  activeSystemId: string;
  onSelectSystem: (system: StarSystem) => void;
  onOpenCreateSystem: () => void;
  onGenerateRandom: () => void;
  onRenameSystem: (system: StarSystem) => void;
  onDeleteSystem: (systemId: string) => void;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  systems,
  activeSystemId,
  onSelectSystem,
  onOpenCreateSystem,
  onGenerateRandom,
  onRenameSystem,
  onDeleteSystem,
  language,
  isOpen,
  onClose,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static top-16 bottom-0 left-0 w-72 bg-slate-950/95 md:bg-slate-950/70 backdrop-blur-md border-r border-slate-800/80 z-35 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Systems List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Header Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onOpenCreateSystem();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.createUniverse}</span>
            </button>

            <button
              onClick={() => {
                onGenerateRandom();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.generateRandomSystem}</span>
            </button>
          </div>

          {/* Systems Categories */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              {t.realSolarSystem}
            </div>

            {systems
              .filter((s) => s.isRealSolarSystem)
              .map((sys) => {
                const isActive = sys.id === activeSystemId;
                return (
                  <div
                    key={sys.id}
                    onClick={() => {
                      onSelectSystem(sys);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`group w-full p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-sky-950/40 border-sky-600/70 text-white shadow-sm shadow-sky-950'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: sys.star.color }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{sys.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {sys.planets.length} {t.planetsTotal}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-sky-400 translate-x-0.5' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                );
              })}
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>{t.customSystems}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {systems.filter((s) => !s.isRealSolarSystem).length}
              </span>
            </div>

            <div className="space-y-1.5">
              {systems
                .filter((s) => !s.isRealSolarSystem)
                .map((sys) => {
                  const isActive = sys.id === activeSystemId;
                  return (
                    <div
                      key={sys.id}
                      className={`group w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-sky-950/40 border-sky-600/70 text-white shadow-sm shadow-sky-950'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <div
                        onClick={() => {
                          onSelectSystem(sys);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: sys.star.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{sys.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {sys.planets.length} {t.planetsTotal}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRenameSystem(sys);
                          }}
                          title={t.renameSystem}
                          className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSystem(sys.id);
                          }}
                          title={t.deleteSystem}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {systems.filter((s) => !s.isRealSolarSystem).length === 0 && (
                <div className="p-4 text-center border border-dashed border-slate-800/80 rounded-lg text-slate-500 text-xs">
                  No custom systems yet. Click &quot;Create Universe&quot; or &quot;Generate Random System&quot;.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Storage Notice & Disclaimers */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-tight">
            <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <span>{t.storageNotice}</span>
          </div>
          <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-tight">
            <Info className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
            <span>{t.scaleDisclaimer}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
