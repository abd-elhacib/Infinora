/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Globe2, Plus, Sparkles, Menu, X } from 'lucide-react';
import { StarSystem, Language } from '../types/space';
import { TRANSLATIONS } from '../data/translations';

interface TopNavProps {
  currentSystem: StarSystem;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenCreatePlanet: () => void;
  onOpenCreateSystem: () => void;
  onGenerateRandom: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSearchResult: (id: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentSystem,
  language,
  onLanguageChange,
  onOpenCreatePlanet,
  onOpenCreateSystem,
  onGenerateRandom,
  searchQuery,
  onSearchChange,
  onSelectSearchResult,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const t = TRANSLATIONS[language];

  // Search filtered bodies
  const searchResults = searchQuery.trim()
    ? currentSystem.planets
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .concat(
          currentSystem.star.name.toLowerCase().includes(searchQuery.toLowerCase())
            ? [
                {
                  id: 'star',
                  name: currentSystem.star.name,
                  type: 'star' as const,
                  color: currentSystem.star.color,
                  size: currentSystem.star.size,
                  distance: 0,
                  speed: 0,
                  descriptionEn: currentSystem.star.descriptionEn,
                  descriptionAr: currentSystem.star.descriptionAr,
                },
              ]
            : []
        )
    : [];

  return (
    <header className="h-16 px-4 md:px-6 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between gap-4 z-30 shrink-0">
      {/* Zone 1: Sidebar Toggle & Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 whitespace-nowrap shrink-0">
            {t.appName}
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-mono tracking-wide px-2 py-0.5 rounded bg-slate-900 border border-slate-800 whitespace-nowrap">
            {currentSystem.name}
          </span>
        </div>
      </div>

      {/* Zone 2: Search input & Language Toggle */}
      <div className="flex items-center gap-3 max-w-md w-full justify-end md:justify-center">
        {/* Search bar with floating dropdown */}
        <div className="relative w-full max-w-xs">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-900/80 text-sm text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-3 py-1.5 border border-slate-800 focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/80 outline-none transition-all"
            />
          </div>

          {searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 py-1">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectSearchResult(item.id);
                      onSearchChange('');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800/80 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-slate-400 capitalize">{item.type.replace('_', ' ')}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400 text-center">
                  {t.noPlanetsFound}
                </div>
              )}
            </div>
          )}
        </div>

        {/* English / Arabic language switch button */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Toggle English / Arabic"
        >
          <Globe2 className="w-3.5 h-3.5 text-sky-400" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* Zone 3: Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onGenerateRandom}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-700/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Generate a fictional random star system"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.generateRandomSystem}</span>
        </button>

        <button
          onClick={onOpenCreatePlanet}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm shadow-sky-600/30 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.createPlanet}</span>
        </button>
      </div>
    </header>
  );
};
